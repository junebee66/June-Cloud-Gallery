// Fetch the JSON file (works in a browser environment)
fetch('allProjects.json')
  .then((response) => response.json())
  .then((originalJSON) => {
    // Transform the JSON
    const transformedJSON = {
      nodes: originalJSON.nodes.map((node) => ({
        id: node.title,
        group: node.type,
      })),
      links: [],
    };

    // Create links for nodes with the same group
    transformedJSON.nodes.forEach((node, index) => {
      transformedJSON.nodes.forEach((otherNode, otherIndex) => {
        if (index !== otherIndex && JSON.stringify(node.group) === JSON.stringify(otherNode.group)) {
          transformedJSON.links.push({
            source: node.id,
            target: otherNode.id,
            value: 1,
          });
        }
      });
    });

    console.log('Transformed JSON:', JSON.stringify(transformedJSON, null, 2));
  })
  .catch((error) => console.error('Error loading JSON:', error));
