import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from './ProductCard';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import Cart, { generateCartItemsFrom } from './Cart.js';


// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  const token = localStorage.getItem('token');
  const [productData, setProductData] = useState([]);
  const [status, setStatus] = useState({
    loadingStatus: true,
    nothingFound: false,
    searchValue: ""
  });
  const [items,setItem] =useState([]);
  const { enqueueSnackbar } = useSnackbar();

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    try {

      const response = await axios.get(`${config.endpoint}/products`);
      if (response.status === 200) {
        setProductData(response.data);
        setStatus({ ...status, loadingStatus: false });
      }
    } catch (err) {
      return {
        "success": false,
        "message": "Something went wrong. Check the backend console for more details"
      }
    }
  };


  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    console.log(text);
    setStatus({ ...status, loadingStatus: false });
    try {
      const response = await axios.get(`${config.endpoint}/products/search?value=${text.target.value}`);
      if (response.status === 200) {
        setProductData(response.data);

      }
    } catch (err) {
      setProductData([]);

      setStatus({ ...status, nothingFound: true });
      return {
        message: "No products found"

      }
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    // let timer;
    // // performSearch(event.target.value);
    // return function(){
    //   const context = this;
    //   clearTimeout(timer);
    //   timer = setTimeout(()=>{
    //     event(status.searchValue);
    //   },debounceTimeout);
    // }
    let timer;
    return function (...args) {
      const context = this;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        event.apply(context, args);
      }, 500);
    };
  };


  // function handleSearch(event){
  //   setStatus({...status,searchValue:event.target.value});
  //   const optimizedFn = useCallback(debounce(handleChange), []);

  // }
  const handleSearch = useCallback(debounceSearch(performSearch, 500), []);





  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };


  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    return items.findIndex((item)=>item.productId ===productId) !==-1;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {

    if(!token)
    {
      enqueueSnackbar("please log in to add to cart",{
        variant:'warning',
      })
      return;

    }
    if(options.preventDuplicate && isItemInCart(items,productId)){
      enqueueSnackbar("item already in cart.use the cart slider to update quatity or remove item",{
        variant:'warning'
      })
      return ;
    }
    try{

      const response = await axios.post(`${config.endpoint}/cart`, {
        productId,
        qty
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      const cartItem = generateCartItemsFrom(response.data,products);
      setItem(cartItem);
      return;
    }catch(e){
      if(e.response){
        enqueueSnackbar(e.response.data.message,{variant:'error'});
      }else{
        enqueueSnackbar("could not fetch products. Check that the backend is running ,return reachable valid JSON",{
          variant:"error"
        })
      }
    }
    
  
};
useEffect(() => {
  performAPICall();
}, []);

useEffect(() => {
fetchCart(token).then((cartData) => generateCartItemsFrom(cartData, productData)).then((cartItems)=>setItem(cartItems));
}, [productData]);

return (
  <div>
    <Header>
      {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
      <TextField
        className="search-desktop"
        size="small"

        InputProps={{
          className: 'search',
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={handleSearch}
      />
    </Header>

    {/* Search view for mobiles */}
    <TextField
      className="search-mobile"
      size="small"
      fullWidth
      InputProps={{

        endAdornment: (
          <InputAdornment position="end">
            <Search color="primary" />
          </InputAdornment>
        ),
      }}
      placeholder="Search for items/categories"
      name="search"
      onChange={handleSearch}
    />
    <Grid container>
      <Grid item className="product-grid" md={token ? 9 : 12}>
        <Box className="hero">
          <p className="hero-heading">
            India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
        </Box>
      </Grid>
      {token ? <Grid item xs={12} md={3} bgcolor="#E9F5E1">
        <Cart products ={productData} items={items} handleQuantity={addToCart}/>
      </Grid> : ""}


      {status.loadingStatus ? <Box display='flex' justifyContent='center' alignItems='center'>
        <CircularProgress />
        <p position='absolute'>loading Products..</p>
    </Box> :(
      <Grid container marginY='1rem' paddingX='1rem' spacing={2}>
        {productData.length? (
          productData.map((product)=>(
            <Grid item xs={6} md={3} key ={product._id}>
              <ProductCard product={product} handleAddToCart={async ()=> await addToCart(token,items,productData,product._id,1,{preventDuplicate:true})}/> 
            </Grid>
          ))
        ):<Box display='flex' justifyContent='center' alignItems='center'>
        <SentimentVeryDissatisfiedIcon />
        <p position='absolute'>No Products Found</p>
    </Box>}
      </Grid>
    )}

      {status.nothingFound && <Box display='flex' justifyContent='center' alignItems='center'>
        <SentimentVeryDissatisfiedIcon />
        <p position='absolute'>No Products Found</p>
      </Box>}

    </Grid>
    <Footer />
  </div>
);
};

export default Products;
