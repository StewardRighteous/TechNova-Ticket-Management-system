1. A component should not go beyond 200 lines
2. Add folders and organize everything appropriately.
3. Each component should be in its own related components folder named appropriately
4. Use barrel files to export similar components from a folder
5. Simple similar components can exist in a same file
6. In any case, do not hard code any data rather put all the data in mockup.json
7. Do not change the data in mockup.json. If the data in there is not sufficient, you can add more data but the data need to be relative to the already existing data.
8. If a component has a lot data processing, make it a parent and the child will be rendered according to data.
9. Data provided in HTML need to be reviewed and can be added to mockup.json instead of hardcoding. 