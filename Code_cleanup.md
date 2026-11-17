Make the following changes only in `src/` folder

- A React Component should not go beyond 200 lines, if it does break it into meaningful components.
- If a code repeats more than 3 times, rewrite it as seperate component.
- A component should not have many hooks, if it does move hooks to a parent. The parent which the hooks was move to, should have only hooks and calls the necessary component

- The folder Structure should be as follows
  - src/
    - Components/
      - Auth/
      - Dashboard/
      - Tickets/
      - Companies/
      - Services/
      - Employees/
      - Settings/
      - Common/
        - modals
        - layout
    - store/
    - types/
    - utils/
- Each file should be inside its appropriate named folder
- If two folders share a similar file, it should be inside common with its appropriate folder name

- Barrel files should be used to import components rather than their original files
- The exporting or index files of each folder should be named 'barrel'
- If there is test file for a file, combine them in a folder and export only the component
