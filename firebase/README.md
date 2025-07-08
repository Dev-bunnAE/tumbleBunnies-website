# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Backing Up Your Project

It's a great practice to back up your work using version control. The standard way to do this is with Git and a remote repository provider like GitHub. Here are the basic steps to get your project backed up:

1.  **Initialize Git:** If you haven't already, open a terminal in your project's root directory and run:
    ```bash
    git init
    ```

2.  **Add Files:** Add all your project files to the staging area.
    ```bash
    git add .
    ```

3.  **Commit Changes:** Create a "snapshot" of your project's current state.
    ```bash
    git commit -m "Initial commit of TumbleBunnies project"
    ```

4.  **Create a GitHub Repository:** Go to [GitHub](https://github.com/new) and create a new, empty repository. Do not initialize it with a README or .gitignore file, as you already have those.

5.  **Link and Push:** Copy the commands from GitHub to link your local repository to the remote one and push your code. They will look something like this:
    ```bash
    git remote add origin https://github.com/your-username/your-repo-name.git
    git branch -M main
    git push -u origin main
    ```

Now your code is safely backed up on GitHub! You can continue to "commit" and "push" your changes as you make progress.
