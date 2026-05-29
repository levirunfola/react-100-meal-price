
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;


export const searchRecipeWithPrices = async (query) => {
  try {
    const searchUrl = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=1`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
        'x-rapidapi-key': API_KEY
      }
    });
    
    const searchData = await searchResponse.json();
    if (!searchData.results || searchData.results.length === 0) return [];

    const recipesWithPrices = await Promise.all(
      searchData.results.map(async (result) => {
        const recipeId = result.id;

        try {
          const priceUrl = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipeId}/priceBreakdownWidget.json`;
          const priceResponse = await fetch(priceUrl, {
            headers: {
              'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
              'x-rapidapi-key': API_KEY
            }
          });

          if (!priceResponse.ok) {
            throw new Error(`Skipping due to status ${priceResponse.status}`);
          }

          const priceData = await priceResponse.json();
          if (!priceData || !priceData.ingredients) {
            throw new Error("Missing ingredients array data");
          }

          return {
            id: recipeId,
            title: result.title,
            image: result.image,
            totalPrice: ((priceData.totalCost || 0) / 100).toFixed(2), 
            ingredients: priceData.ingredients.map((item, index) => ({
              id: item.id ? `${item.id}-${index}` : `${item.name.replace(/\s+/g, '-')}-${index}`,
              name: item.name,
              amount: item.amount?.metric?.value || item.amount || 0,
              unit: item.amount?.metric?.unit || item.unit || '',
              price: ((item.price || 0) / 100).toFixed(2) 
            }))
          };
        } catch (innerError) {
          console.warn("Skipping individual recipe pricing:", innerError.message);
          return {
            id: recipeId,
            title: result.title,
            image: result.image,
            totalPrice: "0.00",
            ingredients: []
          };
        }
      })
    );

    return recipesWithPrices;

  } catch (error) {
    console.error("API Fetch ERROR:", error);
    return [];
  }
};