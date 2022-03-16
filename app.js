const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended: true
}))

mongoose.connect('mongodb+srv://admin-abdulqadir:todolist123@todolist.ipnkg.mongodb.net/todolistDB', 
{ useNewUrlParser: true, useUnifiedTopology: true})

mongoose.connection.once('open', function (err) {
    if (err) {
        console.log(err)
    } else {
        console.log('connected to the database successfully')
    }
})

const itemsSchema = {
    name: String
}

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const Item = mongoose.model('item', itemsSchema)
const List = mongoose.model('list', listSchema)

const item1 = new Item({
    name: 'Welcome to your todolist!'
})
const item2 = new Item({
    name: 'Hit the + button to add a new item'
})
const item3 = new Item({
    name: '<== Hit this to delete an item'
})

const defaultItems = [item1, item2, item3]

app.get('/', function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('Inserted default items successfully')
                }
            })
            res.redirect('/')
        } else {
            res.render('list', {
                kindOfDay: 'Today',
                newListItems: foundItems
            })
        }
    })
})

app.get('/:customListName', function (req, res) {
    const customListName = _.capitalize(req.params.customListName)

    List.findOne({
        name: customListName
    }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect('/' + customListName)
            } else {
                res.render('list', {
                    kindOfDay: foundList.name,
                    newListItems: foundList.items
                })
            }
        }
    })
})

app.post('/', function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list
    const newItem = new Item({
        name: itemName
    });
    if (listName === 'Today') {
        newItem.save();
        res.redirect('/')
    } else {
        List.findOne({
            name: listName
        }, function (err, foundList) {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect('/' + listName);
        })
    }
})

app.post('/delete', function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName

    if (listName === 'Today') {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err)
            } else {
                console.log('successfully removed the checked item')
                res.redirect('/')
            }
        })
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: checkedItemId
                }
            }
        }, function (err, foundList) {
            if (!err) {
                res.redirect('/' + listName)
            }
        })
    }
})

app.listen(3500, function () {
    console.log('server running on port 3500')
});





