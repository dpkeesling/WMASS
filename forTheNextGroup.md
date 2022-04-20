# For the next group

This project will need to be carried on by another group

## Future plans
### 1. Read from excel and shapefiles into a javascript object. Use that object to place map objects
- Reference branch convert-json-to-class. We were working on this branch, and you can continue on our work from there
- Currently (in master), we have it hard-coded to read from country data.  There is an object (countryData) which contains the combined shapefile and Excel data for each country.
- Some work needs to be done to 1) abstract this logic out so that it will work with any type of entity (not just countries), and 2) remove the assumption that each header column will begin with the character 'n' (see comments in code).
- Our vision for this was as follows:
    - Read in catchment data from an Excel file and a shapefile (and combine them together), just like we did with countries
    - Call shapefile.toGeoJSON() to convert shapefile data to GeoJSON.  This is important because you can parse through the GeoJSON to acquire the coordinates of the geometry (in this case, the catchments)
    - Use these coordinates as a frame of reference so that you can 1) load in reservoirs/hydropower plants/etc. from Excel and 2) place them in their respective catchments (since they have catchmentID's but not coordinates)
### 2. Read in shapefiles and excel files dynamically
- Prompt a user for the name of a shapefile or excel file, and then read that file from the file system after
### 3. Make this software work without internet access
- Being that this software is going to be used in developing countries, there is slim chance of the end user having internet access. Mapbox API requires internet access. We need to either find an alternative to Mapbox, or find a way to make Mapbox work without internet access
