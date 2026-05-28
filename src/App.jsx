import { useState, useEffect } from 'react'
import './App.css'
import { searchRecipeWithPrices } from './services/mealService.js'

function App() {
  const [input, setInput] = useState('')
  const [rResults, setRResults] = useState([])
  const [loading, setLoading] = useState(false) 
  const [errorM, setErrorM] = useState('')
  const [list, setList] = useState([])
  const [fridge, setFridge] = useState(() => {
    const savedFridge = localStorage.getItem('my-fridge');
    return savedFridge ? JSON.parse(savedFridge) : [];
  });
  const [checkedItems, setCheckedItems] = useState(() => {
    const savedChecked = localStorage.getItem('checked-ingredients');
    return savedChecked ? JSON.parse(savedChecked) : {};
  });
  useEffect(() => {
    localStorage.setItem('my-fridge', JSON.stringify(fridge));
  }, [fridge]);
  useEffect(() => {
    localStorage.setItem('checked-ingredients', JSON.stringify(checkedItems));
  }, [checkedItems]);
  const handleCheckboxChange = (ingredientId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [ingredientId]: !prev[ingredientId], 
    }));
  };
  const calculateRecipeTotal = (recipe) => {
    const baseTotal = parseFloat(recipe.totalPrice) || 0;
    const checkedDeductions = recipe.ingredients.reduce((acc, ing) => {
      if (checkedItems[ing.id]) {
        return acc + (parseFloat(ing.price) || 0);
      }
      return acc;
    }, 0);
    const updatedTotal = baseTotal - checkedDeductions;
    return updatedTotal < 0 ? 0 : updatedTotal.toFixed(2);
  };
  const [openView, setOpenView] = useState('')
const handleOpenView = (id) => {
  if (id === 'fridge') {
       setOpenView((prevList) => {
      const isAlreadyTracked = prevList?.id === 'fridge'; 
      return {
        id: 'fridge',
        open: isAlreadyTracked ? !prevList.open : true 
      };
    });
    return;
    }
  if (id === 'recipe') {
    setOpenView((prevList) => {
      const isAlreadyTracked = prevList?.id === 'recipe'; 
      return {
        id: 'recipe',
        open: isAlreadyTracked ? !prevList.open : true 
      };
    });
    return;
    }
  if (id === 'map') {
    setOpenView((prevList) => {
      const isAlreadyTracked = prevList?.id === 'map'; 
      return {
        id: 'map',
        open: isAlreadyTracked ? !prevList.open : true 
      };
    });
    return;
  }
  const matchedRecipe = fridge.find((recipe) => recipe.id === id);
  if (!matchedRecipe) return;
  setOpenView((prevList) => {
    const isAlreadyTracked = prevList?.id === matchedRecipe.id;
    return {
      id: matchedRecipe.id,
      open: isAlreadyTracked ? !prevList.open : true
    };
  });
};
  const handleDeleteL = (id) => {
   setList(() => {
    let listContent = list.filter((a) => {
    return a.id!==id
  })
   return listContent==undefined?[]:listContent;
  })
  }
  const handleDeleteF = (id) => {
   setFridge(() => {
    let fridgeContent = fridge.filter((a) => {
    return a.id!==id
  })
   return fridgeContent==undefined?[]:fridgeContent;
  })
  }
  const handleAddFridge = (id) => {
     const matchedRecipe = list.find((recipe) => recipe.id === id);
  if (!matchedRecipe) return; 
  setFridge((prevList) => {
    if (prevList.some((item) => item.id === id)) {
      alert("This recipe is already in your fridge!");
      return prevList;
    }
    return [...prevList, matchedRecipe];
  });
  setList(() => {
    let listContent = list.filter((a) => {
    return a.id!==id
  })
   return listContent==undefined?[]:listContent;
  })
  }
 const handleAddList = (id) => {
  const matchedRecipe = rResults.find((recipe) => recipe.id === id);
  if (!matchedRecipe) return; 
  setList((prevList) => {
    if (prevList.some((item) => item.id === id)) {
      alert("This recipe is already in your list!");
      return prevList;
    }
    return [...prevList, matchedRecipe];
  });
};
  const handleSearchR = async () => {
    if (!input) {
      setErrorM('Please enter an recipe');
      return;
    }
    setErrorM(''); 
    setLoading(true); 
    try {
      const data = await searchRecipeWithPrices(input);
      setRResults(data);
      setResults([]);
      setInput(''); 
    } catch (error) {
      console.log('error');
    } finally {
      setLoading(false); 
    }
  }
  const now = new Date();
  
  return (
    <div id="all">
      <div id="head" >
        <div className="button">
          <button onClick={() => handleOpenView('recipe')}>Recipes</button>
        <button  onClick={() => handleOpenView('map')}>Store Locations</button>
        <button 
        onClick={() => handleOpenView('fridge')}>MyFridge</button>
        </div>
       <h1>Meal-Price</h1>
       <div id="searchBar" >
       <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='Search recipes (e.g., cookies)...'
      />
      <button onClick={handleSearchR} disabled={loading}>
        {loading ? 'Searching...' : 'Search 🔍'}
      </button>
      </div>
      <h3>Date: {now.toLocaleDateString()}</h3>
      </div>
      {  openView.id==='map'&&openView.open===true?(
      <div id="mapBody">
        <h2 id="title">Map</h2>
         <iframe id ="map" src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d106292.97452654278!2d-117.40005334399015!3d33.640174583383114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1swalmarts%20near%20me!5e0!3m2!1sen!2sus!4v1780003318137!5m2!1sen!2sus" style={{ style:"border:0", allowFullScreen:'', loading: "lazy", referrerPolicy: "no-referrer-when-downgrade"}}></iframe>
      </div>
      ):(
          <div id="body" > 
        <div id="list" >
          <h2>Listed Recipes</h2>
          { list.length!==0? list.map((a) => (
            <div key={a.id}>
             <h3>{a.title}</h3>
             <h4>${a.totalPrice}</h4>
             <button 
             onClick={() => handleAddFridge(a.id)}>Add to fridge</button>
             <button onClick={() => handleDeleteL(a.id)}>Delete</button>
            </div>
             )):( 
            <p>nothing in list yet...</p>
          )
        }
          </div>
          <div id="content">
      {errorM && <p style={{ color: 'red' }}>{errorM}</p>}
      { openView.id!=='recipe'&&openView.id!=='map'?(<>
  <h2>My Recipes</h2>
  <div id="fridge">
   {fridge.map((a) => (
            <div className="item" key={a.id}>
             <h3>{a.title}</h3>
             <h4>${calculateRecipeTotal(a)}</h4>
              <img src={a.image} alt={a.title} style={{ width: '100%',maxWidth: '200px', maxHeight: '100px', objectFit: 'cover', borderRadius: '9999px' }} />
             <div><button 
             onClick={() => handleOpenView(a.id)}>View</button>
             <button 
             onClick={() => handleDeleteF(a.id)}>Delete</button>
             </div>
             { openView.id===a.id&&openView.open===true?
              (
                <>
                 {a.ingredients.map((ing) => (
          <li key={ing.id}>
        <span style={{ textDecoration: checkedItems[ing.id] ? 'line-through' : 'none' }}>
        {ing.amount} {ing.unit} of {ing.name} — <small>(Price: ${ing.price})</small>
        </span>
        <input 
        type="checkbox" 
        checked={!!checkedItems[ing.id]}
        onChange={() => handleCheckboxChange(ing.id)} 
        />
        </li>
          ))}
                </>
              ):(
                <>
                </>
              )
              }
            </div>
          )
            
          )}
          </div>
  </>
) : (<></>)}
{ openView.id==='recipe'&& openView.open===true?(
  <>
   <h2>Recipe Search</h2>
    { rResults.length===0?(<h4 style={{color: 'darkgray'}}>Search Recipes...</h4>):(rResults.map((recipe) => (
      <div key={recipe.id} className="recipe-card" style={{ backgroundColor: 'beige', border: '3px solid black', padding: '15px', margin: '15px 0', borderRadius: '8px' }}>
        <img src={recipe.image} alt={recipe.title} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }} />
        <h3>{recipe.title}</h3>
        <button onClick={() => handleAddList(recipe.id)}>Add</button>
        <div style={{ backgroundColor: 'lightgreen', padding: '10px', borderRadius: '4px', margin: '10px 0' }}>
          <strong>Estimated Recipe Totals:</strong>
          <p style={{ color: 'green' }}>🛒 Total: ${recipe.totalPrice}</p>
        </div>
        <h4>Ingredients Checklist:</h4>
        <ul>
          {recipe.ingredients.map((ing) => (
            <li key={ing.id}>
              {ing.amount} {ing.unit} of {ing.name} — <small>(Price: ${ing.price})</small>
            </li>
          ))}
        </ul>
      </div>
    )))}
  </>
):(<></>)}
      </div>
    </div>
      )
      }
    </div>
  )
}

export default App