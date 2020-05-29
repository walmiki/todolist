//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
var _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sumit:Nov@2019@rockbuzz-wwjgt.mongodb.net/todolistDB",{ useNewUrlParser: true , useUnifiedTopology: true, useFindAndModify: false },);

const itemsSchema= new mongoose.Schema({
  name:{
    type:String,  
    required:true
  }
});

const Item= new mongoose.model("Item",itemsSchema);

const item1= new Item({
  name:"Welcome to your todolist!"
});

const item2= new Item({
name:"Hit the + button to add a new item."
});

const item3= new Item({
name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema= new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});



const List= new mongoose.model("List",listSchema);



app.get("/", function(req, res) {

  // const day = date.getDate();
  Item.find({},function(err,foundItems){
      if(err){
        console.log(err);        
      }else{
        if(foundItems.length===0){
          Item.insertMany([item1,item2,item3],function(err){
            if(err){
              console.log(err);    
            }else{
              console.log("Successfully added in the model");
            }
          });
          res.redirect("/");
        }else{
          res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
      }
  });
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  
  const item = new Item({
    name:itemName
  });

  if(listName=== "Today" ){
    item.save();
    res.redirect("/")
  } else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();      
      res.redirect("/"+listName);
      
    });
  }
  
});

app.post("/delete",function(req,res){
  if(req.body.listName==="Today"){
    Item.findByIdAndRemove({_id:req.body.c1},function(err){
      if(err){
        console.log(err);
      }else{
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:req.body.listName},{$pull:{items:{_id:req.body.c1}}},function(err,foundList){
        if(!err){
          res.redirect("/"+req.body.listName);
        }
    });
  }
    
  });
  


app.get("/:newList",function(req,res){
  
    
  const customListName = _.capitalize(req.params.newList);

    List.findOne({name:customListName},function(err,foundList){
      if(!err){
        if(!foundList){
          const list = new List({
            name:customListName,
            items:defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
        }else{
          res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
        } 
      }
    });
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
