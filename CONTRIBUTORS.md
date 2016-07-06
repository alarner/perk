# Contributing to Perk

We'd love for you to contribute to our source code and to make AngularJS even better than it is
today! Here are the guidelines we'd like you to follow:

 - [Code of Conduct](#code-of-conduct)
 - [Question or Problem?](#got-a-question-or-problem)
 - [Contribution Guidelines](#contribution-guidelines)
 - [Found an Issue?](#found-an-issue)
 - [Want a Feature?](#want-a-feature)
 - [Found a Documentation problem?](#found-a-documentation-problem)

## Code of Conduct
Help us keep Perk open and inclusive. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Got a Question or Problem?

If you have questions about how to contribute to, or use Perk, please direct these to [Twitter](https://twitter.com/alarner), our [Slack Channel](https://perkframework.slack.com) or [StackOverflow](http://stackoverflow.com/).

## Contribution Guidelines

We're especially interested in helping first time contributors make improvements to Perk. If you have any questions about how to submit changes feel free to [reach out to us directly]. Before you submit your pull request please consider the following guidelines:

1. Search [GitHub](https://github.com/alarner/perk/pulls) for an open or closed Pull Request that relates to your submission. You don't want to duplicate effort.
1. Fork the Perk repository.
1. Inside of your local copy of the repository, install the necessary dependencies:

	```shell
	npm install
	```

1. Make your changes in a new git branch:

	```shell
	git checkout -b my-fix-branch master
	```

1. Ensure that your code adheres to the code style guidelines by running:

	```shell
	npm run eslint
	```

1. Ensure that all of the tests pass by running:

	```shell
	npm test
	```

1. Commit your changes using a descriptive commit message.
1. Push your branch to GitHub:

	```shell
	git push origin my-fix-branch
	```

1. In GitHub, send a pull request to `perk:master`.
1. If we suggest changes then:
  * Make the required updates.
  * Re-run the eslint.
  * Re-run the test suite to ensure tests are still passing.
  * Commit your changes to your branch (e.g. `my-fix-branch`).
  * Push the changes to your GitHub repository (this will update your Pull Request).

Thank you for your contribution!

## Found an Issue?
If you find a bug in the source code or a mistake in the documentation, you can help us by submitting an issue to our [GitHub Repository](https://github.com/alarner/perk/issues). Even better you can submit a Pull Request with a fix.

## Want a Feature?
You can request a new feature by submitting an issue to our [GitHub Repository](https://github.com/alarner/perk/issues).

## Found a Documentation problem?
If you want to help improve the docs, we are extremely appreciative of Pull Requests to the [Documentation GitHub Repository](https://github.com/alarner/perk-docs).