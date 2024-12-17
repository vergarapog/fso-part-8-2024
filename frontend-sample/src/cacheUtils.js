// Function that takes care of manipulating cache
export const updateCache = (cache, query, addedPerson) => {
    // Helper function to eliminate saving the same person twice
    const uniqByName = (array) => {
      const seen = new Set();
      return array.filter((item) => {
        const key = item.name;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    };
  
    // Update the cache with the new person, ensuring uniqueness
    cache.updateQuery(query, ({ allPersons }) => {
      return {
        allPersons: uniqByName(allPersons.concat(addedPerson)),
      };
    });
  };