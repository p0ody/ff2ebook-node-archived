import * as Logging from "./Logging";
import * as typedef from "./typedef";
import { DBHandler } from "./DBHandler";
let Async = require("async");



export let searchFor = function (search: any, page: number, returnCallback: typedef.Callback)
{
    if (search.length == 0)
        return returnCallback("Invalied search value.");

    if (isNaN(page))
        return returnCallback("invalid page number.");

    Async.parallel({
        count: function (callback: typedef.Callback)
        {
            DBHandler.getDB().query("SELECT COUNT(*) as `count` FROM `fic_archive` WHERE `id` LIKE ? OR `title` LIKE ? or `author` LIKE ? ORDER BY `title`;", [ "%"+ search +"%", "%"+ search +"%", "%"+ search +"%" ], function (err: any, results: any)
            {
                if (err)
                {
                    Logging.trace(err);
                    return callback("An error has occured while accessing database.");
                }


                callback(null, results[0].count);
            });
        },
        search: function (callback: typedef.Callback)
        {
            var offset = (page == 1 ? "0" : (page * <number><unknown>process.env.SEARCH_RESULT_PER_PAGE) - <number><unknown>process.env.SEARCH_RESULT_PER_PAGE);
            DBHandler.getDB().query("SELECT * FROM `fic_archive` WHERE `id` LIKE ? OR `title` LIKE ? or `author` LIKE ? ORDER BY `title` LIMIT " + offset + ", " + process.env.SEARCH_RESULT_PER_PAGE + ";", [ "%"+ search +"%", "%"+ search +"%", "%"+ search +"%" ], function (err: any, results: any
            )
            {
                if (err)
                {
                    Logging.trace(err);
                    return callback("An error has occured while accessing database.");
                }

                if (results.length <= 0)
                    return callback("No match found.");


                callback(null, results);
            });
        }
    }, function (err: any, results: any) // Completed callback
    {
        returnCallback(err, results);
    });

}