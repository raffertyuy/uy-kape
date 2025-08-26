# Vibe Coding Guide

This app is **100% vibe coded!** using [GitHub Copilot](https://copilot.github.com)! This document explains the prompts created to make this possible.

Most of the features were implemented using the [plan-implement-run pattern](#vibe-coding-walkthrough-plan-implement-run). This starts with writing a task objective in [scratch.md](/scratch.md) and then running `/1-plan #file:scratch.md` in GitHub Copilot Chat.

If you want to go straight to the prompts, theck out the files in the [.github/](/.github/) folder.

## Vibe Coding Walkthrough: Plan-Implement-Run

We started with project by building the foundations for the plan-implement-run pattern. Check out this [blog post](https://raffertyuy.com/raztype/vibe-coding-plan-implement-run/) to learn of its foundations.

### Step 1: Plan

1. Think about what feature or task you want the agent to implement. Edit [scratch.md](/scratch.md) if you think it will be a long requirement.
2. Open up GitHub Copilot Chat and run one of the following:

  ```text
  /1-plan YOUR_REQUIREMENTS_HERE
  ```
  
  or, if it's a long prompt,

  ```text
  /1-plan #file:scratch.md
  ```

This will generate a new plan in [/docs/plans/](/docs/plans/). Review the generated plan and  keep iterating with the agent on what needs to be revised.

> [!TIP]
> To see previously generated plans, check out the [/docs/plans/](/docs/plans/) folder.

At this point, you may want to commit the generated plan in a new branch. `/util.new-git-branch` does this.

### Step 2: Implement

```text
/2-implement #file:THE_GENERATED_PLAN.plan.md
```

This will begin the implementation process based on the plan.

> [!TIP]
> If you are able, it is useful to actively read and check what the agent is doing. If you see that it is going the wrong direction, press the **STOP** button in the Copilot Chat panel and correct its course. Here are frequent interruption messages used while implementing this:
>
> - `supabase cli is not globally installed, see #file:supabase_cli_instructions.md`
> - `don't forget to take into account our #file:dual_testing_strategy.md`
> - `since you made db schema changes, update #file:schema.md and #file:db_schema.md`
> - `The app is running again, try again`

**The agent will stop implementation at some point, ask it to continue**
As the agent goes through the implementation plan, it will occassionally _"summarize the conversation history"_. This means that the agent's context window is full and it will try to summarize everything in the previous chat history.

**UNFORTUNATELY** this also means that some of the clear instructions in our `/2-implement` prompt was summarized, causing it to stop instead of continuing (that's my theory at least). If this happens, run:

```text
/continue-implementation-plan
```

> [!NOTE]
> This is the reason why we have repeated **"Additional Instructions"** on every step of the [plan](/.github/prompts/1-plan.prompt.md). We are assuming that the agent might summarize certain general instructions (Not sure, but I'm assuming that it might also summarize the instructions in [copilot-instructions](/.github/copilot-instructions.md)).

### Step 3: Run

Once implementation is done, do a final check and run using this prompt:

```text
/3-run
```

This runs the app according to the [regression testing methodology](/.github/prompt-snippets/regression-test.md), and fixes any issues that it encounters. This includes validating if implementation complies with this project's [definition of done](/docs/specs/definition_of_done.md).

### (OPTIONAL) Step 4: Update Documents

#### Functional Specifications

If the implementation includes new functional user flows, run this utility to update the [application overview](/docs/specs/application_overview.md) and [functional specifications](/docs/specs/functional_specifications.md) documents.

```text
/util.update-functional_specs-md
```

#### File Structure

If the implementation created new files and folders, run this utility to update the [file_structure](/docs/file_structure.md) document.

```text
/util.update-file_structure.md
```

### (OPTIONAL) Step 5: Full Regression Testing

Once the functional documents are updated, you can try running a full regression test of the app.

```text
/regression-test
```

> [!WARNING]
> The agent end with a response saying that your app is _"PRODUCTION READY"_. I do not agree with this as there are still many considerations to truly make an app production ready.
> I tried adding prompts to tell it not to respond like this, but it still does. So if responds like this, just ignore it.

### Step 6: Submit a Pull Request and fix CI errors

At this point, you are ready to submit a pull request. Head to [github.com](https://github.com) to do so. There is **no prompt file** for this - as it's easier to take advantage of GitHub Copilot's PR summary feature.

Wait for the CI workflows to run. In the event of errors:

1. Download the raw log of the CI that failed, and then head back to VS Code
2. Copy the log into a new `dump.log` file.
3. Prompt copilot with something like `Fix the CI workflow failures, see #file:dump.log`.

Once everything is fixed, merge and close the PR.

### (OPTIONAL) Step 7: Full exploratory testing on the deployed application

When the app is deployed (e.g. if you have continuous deployment configured), you may choose to ask Playwright MCP to do a full exploratory test on your deployed app and report any issues encountered.

```text
/exploratory-test the deployed app in URL_HERE
```

Because this is testing on a deployed environment, the agent will only report back findings without fixing anything. It's now up to you to decide the next course of action.

### Step 8: REPEAT

Now you are done! You can start the process over again for new features or improvements.
To clean up your local git, run:

```text
/util.clean-git-branches
```

## Additional Utility Prompts, and more

There are other prompts found in the [.github/](/.github/) folder that are not mentioned in this guide. Explore this folder to see what they are.

Many of these are the _utility prompts_ (with the file format `util.*.prompt.md`). These are handy prompts that are useful for various regular tasks.
