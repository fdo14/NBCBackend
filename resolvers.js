const News = require("./models/News");
const request = require("request-promise");

//Two global variables will allow us to only make requests when absolutely necessary
//Without the requestDate we would need to access the updatedAt field on our database to see what
//we need to do. This eliminates a whole DB request
let requestDate = null; 
let newsId = null;

//This function actually fetches the web data
const fetchWebData = async () => {
    const url = "https://s3.amazonaws.com/shrekendpoint/news.json"; //The url endpoint
    const {data} = await request({ url, json: true }); //Actually make the request
    
    let array = []

    //Iterate through the data we received and only store items in our array that are 'item', 'items', or 'videos
    for(let obj of data) {
        if(obj.item) {
            delete obj.item.tracking    //Extra information that I won't need
            array = [...array, obj.item]    //Add the new item to the array
        }
        if(obj.items) {
            for(let item of obj.items) {    //I want to look at every 'item' of 'items'
                if(item.published && item.type === 'article') {
                    delete item.tracking    //Extra information that I won't need
                    array = [...array, item]    //Add each individual item
                }
            }
        }
        if(obj.videos) {
            for(let video of obj.videos) {  //I want to look at every 'video' of 'videos'
                delete video.tracking   //Extra information that I won't need
                array = [...array, video]   //Add each individual video to the array
            }        
        }
    }
    
    //We can now sort our array by date published so that the user receives only the freshest news
    array.sort(function(a,b){
        return new Date(b.published) - new Date(a.published);
    });
    
    //Return the sorted array for consumption
    return array
}

//This function will originally set the data in our database if it is empty
const setWebData = async (arr) => {
    let arrSetWebData = await fetchWebData()    //Grab the sorted array from fetchWebData()

    //Set the array on our News model as thew 'news' property
    const newData = await new News({
        news: arrSetWebData
    }).save();

    newsId = newData._id    //Set our global newsId value as the id of our one db entry
    return newData;     //Return our newData so the client can consume it
}

//This function will update that one original database entry
const updateWebData = async (id) => {
    let arrUpdateWebData = await fetchWebData() //Grab the sorted array from fetchWebData()

    //Update the database with our new updated web data
    const updatedWebData = await News.findOneAndUpdate(
        { _id: id},
        {upsert:false},
        { $set: { news: arrUpdateWebData } }
    );

    return updatedWebData;  //Return our updatedData so the client can consume it
}

module.exports = {
    //Define our one query
    Query: {
        //getNews is responsible for fetching and updating the news
        getNews: async (root, args, ctx) => { 
            //If the news has not been requested before, our db is empty and needs to be populated
            if(requestDate === null){
                requestDate = new Date()    //Set our last requested time to now
                return setWebData() 
            } 

            //If our last request was less than one minute ago, just return the data from the db
            else if (((new Date) - requestDate) < 60000) {
                let dbData = await News.find({})    //Grab our data from the database
                newsId = dbData[0]._id  //Set the global newsId variable
                return dbData[0]    //Make sure that we are returning only one document
            } 

            //Otherwise we are working with old data and should update
            else {
                requestDate = new Date()    //Set the last requested date as now
                return updateWebData(newsId)
            }
        }  
    }   
}
