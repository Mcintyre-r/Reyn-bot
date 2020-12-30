const db = require("../dbConfig.js")

module.exports = {
    addVisitor,
    clearVisitors,
    getVisitors
}

function addVisitor(UID){
    return db("Visitor").insert({"UID": UID}, "UID")
}

function clearVisitors(){
    return db("Visitor").del();
}

function getVisitors(){
    return db("Visitor")
}