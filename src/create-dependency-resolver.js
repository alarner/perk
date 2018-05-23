const path = require('path');

const _ = require('lodash');

module.exports = function createDependencyResolver(dependencies) {
  const resolutionTree = {};

  function getNode(treePath, tree) {
    let node = tree;
    for(const step of treePath) {
      node = node[step];
      if(node === undefined) {
        return node;
      }
    }
    return node;
  }

  function isReadyToResolve(requires) {
    for(const req of requires) {
      const treePath = req.split('/');
      if(!getNode(treePath, resolutionTree)) {
        return false;
      }
    }
    return true;
  }

  function countUnresolved(parentNode) {
    let result = 0;
    for(const key in parentNode) {
      const childNode = parentNode[key];
      if(_.isPlainObject(childNode)) {
        result += countUnresolved(childNode);
      }
      else if(!childNode) {
        result++;
      }
    }
    return result;
  }

  function resolveDependencyIteration(treePath = []) {
    const parentNode = getNode(treePath, dependencies);
    const resolutionNode = getNode(treePath, resolutionTree);
    for(const key in parentNode) {
      const childNode = parentNode[key];
      const strippedKey = path.basename(key, '.js');
      if(_.isFunction(childNode)) {
        resolutionNode[strippedKey] = !Boolean(childNode.requires);
        if(childNode.requires) {
          if(isReadyToResolve(childNode.requires)) {
            parentNode[strippedKey] = childNode(dependencies);
            if(strippedKey !== key) {
              delete parentNode[key];
            }
            resolutionNode[strippedKey] = true;
          }
        }
        else {
          parentNode[strippedKey] = parentNode[key];
          if(strippedKey !== key) {
            delete parentNode[key];
          }
        }
      }
      else if(_.isPlainObject(childNode)) {
        resolutionNode[key] = {};
        resolveDependencyIteration(treePath.concat(key));
      }
      else {
        resolutionNode[strippedKey] = true;
      }
    }
  };

  return function depenencyResolver() {
    let lastUnresolvedCount = null;
    let unresolvedCount = null;
    do {
      lastUnresolvedCount = unresolvedCount;

      resolveDependencyIteration();

      unresolvedCount = countUnresolved(resolutionTree);
    } while(unresolvedCount > 0 && unresolvedCount !== lastUnresolvedCount);
    return unresolvedCount;
  };
};
