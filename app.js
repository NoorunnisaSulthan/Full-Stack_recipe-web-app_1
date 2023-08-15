const express = require("express");
const path=require('path')
const app = express();
//app to use ejs
app.set("view engine", "ejs");
//to add static css files
app.use(express.static("public"));
app.use(express.static("uploadedImg"));

//to read from input field
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
var filen=[]
//for file upload
//enable edit to aslo have predef images
const multer = require('multer');
const storage = multer.diskStorage({
  destination:'./uploadedImg',
  filename: (req, file, cb) => {
  
   
    cb(null,  Date.now() + path.extname(file.originalname));
    return Date.now() + path.extname(file.originalname)
  }
});
console.log(filen);

// Use upload.array() to handle multiple images
const upload = multer({ storage:storage });
const port = process.env.PORT || 3000; 
require('dotenv').config();
const dbPassword = process.env.atlas_pwd;
app.listen(port, () => {
  console.log("server started at 3000");
});
let mongoose = require("mongoose");
const { table, log } = require("console");
const server = "127.0.0.1:27017";
const database = "RecipeWebsiteDatabase";
class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose
    .connect(`mongodb+srv://noorunnisa_admin:${dbPassword}@cluster0.mvsarej.mongodb.net/${database}?retryWrites=true&w=majority`)
      .then(() => {
        console.log("Database connection successful");
      })
      .catch((err) => {
        console.error("Database connection failed");
      });
  }
}
module.exports = new Database();

const { Schema } = mongoose;

const recipeSchema = new Schema({
  foodType: String,
  title: String,
  description: String,
  section: Number,
  heading: String,
  content: String,
  ingredients:[String],
  steps:[String],
  finalDishImage:String,
  ingredImage:String,
  stepsImage:[String]
  
});

const newsletterSchema=new Schema({
  email:String
})
//created a table/collection
const Breakfast = mongoose.model("Breakfast", recipeSchema);
const Lunch = mongoose.model("Lunch", recipeSchema);
const Dinner = mongoose.model("Dinner", recipeSchema);
const newsletterMail=mongoose.model("newsletterMail",newsletterSchema)

const breakfastRecipes = [];
const lunchRecipes = [];
const dinnerRecipes = [];
const emails=[]
//getting all multiples of 3
const multiplesOf3 = [];
for (let i = 0; i < 100; i++) {
  if (i / 3 == 0) {
    multiplesOf3.push(i);
  }
}



app.get("/", (req, res) => {
  res.render("home");
});

app.get("/compose", (req, res) => {
  res.render("compose");
});



app.get("/recipes/:mealType", (req, res) => {
  const mealType = req.params.mealType;
  //the url should have all lowercase
  
  
  if (mealType == "breakfast") {
    Breakfast.find().then(function (brecipefound) {
      console.log(brecipefound);
      console.log(brecipefound.length);
      if (brecipefound.length == 0) {
        Breakfast.insertMany(breakfastRecipes);
        res.redirect(`/recipes/${mealType}`);
      } else {
     
        res.render("recipes", {
          RecipesList: brecipefound,
          foodtype: brecipefound[0].foodType,
          nextRowIndicator: multiplesOf3,
          mealType:mealType,
         
          
        });
      }
    });
  } else if (mealType == "lunch") {
    Lunch.find().then(function (lrecipefound) {
      if (lrecipefound.length == 0) {
        Breakfast.insertMany(lunchRecipes);
        res.redirect(`/recipes/${mealType}`);
      } else {
        res.render("recipes", {
          RecipesList: lrecipefound,
          foodtype: lrecipefound[0].foodType,
          nextRowIndicator: multiplesOf3,
          mealType:mealType,
         
        });
      }
    });
  } else {
    Dinner.find().then(function (drecipefound) {
      if (drecipefound.length == 0) {
        Dinner.insertMany(dinnerRecipes);
        res.redirect(`/recipes/${mealType}`);
      } else {
        res.render("recipes", {
          RecipesList: drecipefound,
          foodtype: drecipefound[0].foodType,
          nextRowIndicator: multiplesOf3,
          mealType:mealType,
        
        });
      }
    });
  }
});
app.post("/compose", upload.fields([{name:'finalRecipeimage',maxCount:1},{name:'ingredientsImage',maxCount:1},{name:'stepsimages',maxCount:10}]), (req, res) => {
  const { ftype, ftitle, fdes, fheading,fcontent,ingredients,steps } = req.body;
  const finalImage=req.files['finalRecipeimage'][0].filename
 const ingredientImage=req.files['ingredientsImage'][0].filename
 const stepsImage=req.files['stepsimages'].map(file=>file.filename)
  // const images=req.files.map(file => file.filename)

const site = ftype.toLowerCase();


console.log(site);

const foodtype=ftype
  if (foodtype == "Breakfast") {
    //creates record/documents
    const newRecipe = new Breakfast({
      foodType: ftype,
      title: ftitle,
      description: fdes,
      heading:fheading,
      content: fcontent,
      ingredients:ingredients,
      steps:steps,
      finalDishImage:finalImage,
  ingredImage:ingredientImage,
  stepsImage:stepsImage
      
    });
    breakfastRecipes.push(newRecipe);
    newRecipe.save();
  } else if (foodtype == "Lunch") {
    //creates record/documents
    const newRecipe = new Lunch({
      foodType: ftype,
      title: ftitle,
      description: fdes,
      heading:fheading,
      content: fcontent,
      ingredients:ingredients,
      steps:steps,
      finalDishImage:finalImage,
  ingredImage:ingredientImage,
  stepsImage:stepsImage

      
    });
    lunchRecipes.push(newRecipe);
    newRecipe.save();
  } else {
    //creates record/documents
    const newRecipe = new Dinner({
      foodType: ftype,
      title: ftitle,
      description: fdes,
      heading:fheading,
      content: fcontent,
      ingredients:ingredients,
      steps:steps,
      finalDishImage:finalImage,
  ingredImage:ingredientImage,
  stepsImage:stepsImage

    });
    dinnerRecipes.push(newRecipe);
    newRecipe.save();
  }

  
 
  res.redirect(`recipes/${site}`);

  // //creates record/documents
  // const newRecipe = new TodoToday({
  //   task: "Learn mongoose",
  // });
});
// show each recipe info in different page
const tables=[Breakfast,Lunch,Dinner]
app.get("/recipes/:mealType/:recipeId",(req,res)=>{
  const id=req.params.recipeId
  tables.forEach(tablename => {
    tablename.findOne({_id:id})
    .then((foundRecipe)=>{ //will only return true or false
      if(foundRecipe){
        console.log("xero");

      res.render("recipePage",{recipe:foundRecipe})
      }
    })
    .catch((err) => {
      console.error("Error occured while retrieving recipe with _id: " +id);
    });
  });

}) 

app.get("/delete/:mealType",(req,res)=>{
  const mealType=req.params.mealType
  const tablenamString =["breakfast","lunch","dinner"]
  var i=0
  tablenamString.forEach((element,index)=>{
if(mealType==element){
  i=index

}
  })

  const tables=[Breakfast,Lunch,Dinner]
 

   console.log(i);
    tables[i].find()
      .then(function(recipeFound){
        if(recipeFound){
        let foodType=recipeFound[0].foodType
        console.log(foodType);
        res.render("deleteItems",{recipes:recipeFound, mealType:mealType})
    }})
     
   

  
})

app.post("/delete",(req,res)=>{
 
  const id=req.body.recipeId
  const mealType=req.body.mealType

  const tables=[Breakfast,Lunch,Dinner]
  const tablenamString =["breakfast","lunch","dinner"]
  var i=0
  tablenamString.forEach((element,index)=>{
if(mealType==element){
  i=index
}
})

tables[i].deleteOne({_id:id})
.then(()=>{
  console.log("Deleted recipe");
  res.redirect(`/recipes/${mealType}`)
  res.on("finish", () => {
    const alertMessage = "Recipe deleted successfully!";
    const alertScript = `<script>alert('${alertMessage}');</script>`;
    res.write(alertScript);
    res.end();
  });
})
.catch((err) => {
  console.log(err);
});


})

app.post("/edit",(req,res)=>{
  const id=req.body.id
  const mealType=req.body.mealType

  const tables=[Breakfast,Lunch,Dinner]
  const tablenamString =["breakfast","lunch","dinner"]
  var i=0
  tablenamString.forEach((element,index)=>{
if(mealType==element){
  i=index
}
})
tables[i].findOne({_id:id})
.then((foundRecipe)=>{
  if(foundRecipe){
    res.render("editRecipe",{recipe:foundRecipe, id:foundRecipe._id, ingred:foundRecipe.ingredients,steps:foundRecipe.steps})
   
 
}
})
.catch((err) => {
  console.log(err);
});
})



app.get("/update/:mealType",(req,res)=>{
  const mealType=req.params.mealType
  const tablenamString =["breakfast","lunch","dinner"]
  var i=0
  tablenamString.forEach((element,index)=>{
if(mealType==element){
  i=index

}
  })

  const tables=[Breakfast,Lunch,Dinner]
 

   console.log(i);
    tables[i].find()
      .then(function(recipeFound){
        if(recipeFound){
        let foodType=recipeFound[0].foodType
        console.log(foodType);
        res.render("updateItems",{recipes:recipeFound, mealType:mealType})
    }})
     
   

  
})

// app.post("/update",(req,res)=>{
// const id=req.body.recipeId
// const { ftype, ftitle, fdes, fheading,fcontent,ingredients,steps } = req.body;
// console.log(id);
// const realft=ftype.toLowerCase()
// const tablenamString =["breakfast","lunch","dinner"]
//   var i=0
//   tablenamString.forEach((element,index)=>{
// if(realft==element){
//   i=index

// }
//   })

//   const tables=[Breakfast,Lunch,Dinner]
//   tables[i].updateOne({_id:id},{
//     foodType: ftype,
//     title: ftitle,
//     description: fdes,
//         heading:fheading,
//         content: fcontent,
//         ingredients:ingredients,
//         steps:steps,
//         finalDishImage:finalImage,
//     ingredImage:ingredientImage,
//     stepsImage:stepsImage
//   })
//   .then(()=>{
//     console.log("Updated recipe");
//     res.redirect(`/recipes/${mealType}`)
//     res.on("finish", () => {
//       const alertMessage = "Recipe deleted successfully!";
//       const alertScript = `<script>alert('${alertMessage}');</script>`;
//       res.write(alertScript);
//       res.end();
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });
  


// })

app.post("/update", upload.fields([{name:'finalRecipeimage',maxCount:1},{name:'ingredientsImage',maxCount:1},{name:'stepsimages',maxCount:10}]), (req, res) => {
  const { ftype, ftitle, fdes, fheading,fcontent,ingredients,steps,id } = req.body;
  const finalImage=req.files['finalRecipeimage'][0].filename
 const ingredientImage=req.files['ingredientsImage'][0].filename
 const stepsImage=req.files['stepsimages'].map(file=>file.filename)
  // const images=req.files.map(file => file.filename)

const site = ftype.toLowerCase();
const tablenamString =["breakfast","lunch","dinner"]
  var i=0
  tablenamString.forEach((element,index)=>{
if(site==element){
  i=index
}
  })

console.log(site);

  const tables=[Breakfast,Lunch,Dinner]
  tables[i].updateOne({_id:id},{
  
    title: ftitle,
    description: fdes,
        heading:fheading,
        content: fcontent,
        ingredients:ingredients,
        steps:steps,
        finalDishImage:finalImage,
    ingredImage:ingredientImage,
    stepsImage:stepsImage
  })
  .then(()=>{
    console.log("Updated recipe");
    res.redirect(`/recipes/${site}`)
    res.on("finish", () => {
      const alertMessage = "Recipe deleted successfully!";
      const alertScript = `<script>alert('${alertMessage}');</script>`;
      res.write(alertScript);
      res.end();
    });
  })
  .catch((err) => {
    console.log(err);
  });

  
 
  res.redirect(`recipes/${site}`);

  // //creates record/documents
  // const newRecipe = new TodoToday({
  //   task: "Learn mongoose",
  // });
});

app.post("/mailSignups",(req,res)=>{
  const email=req.body.userEmail

  const visitorEmail = new newsletterMail({
  email:email

  });
  newsletterMail.insertMany(visitorEmail)
res.redirect("/thankYou")

})

app.get("/thankYou",(req,res)=>{
  res.render("subscriberThanks")
})

app.get("/mailMySubscribers",(req,res)=>{
  newsletterMail.find()
    .then((foundusermail)=>{
      res.render("mailingList",{user:foundusermail})
    })
 
})

app.get("/underconstruction",(req,res)=>{
  res.render("underConstruction")
})