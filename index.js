/*
            Types of data used in the module
            @Types{
                String : Holds chain of characters
                Json : Accept json objects
                Array<Type> : Store values of the right data type
                Bool : Holds values like true or false
                Any : Can be anything
                Number : Hold numeric values
                Void : Just nothing
                Exception : Hold a custom exception
                Null : It's a null value
            }

            Objective of project: Create a easy module for http requests

            Start of project : 02/22/2022 23:07
        */


let /* String */ HEADERS = "HEADERS";
let /* String */ URL = "URL";
let /* String */ URL_DATA = "URL_DATA";
let /* String */ DATA = "DATA";

class httpRequest {

    // Global class's variables, will be used to make the HTTP request

    /* String | Null */ #targetUrl = null;
    /* Json | Null */ #data = null;
    /* Json | Null */ #headers = null;
    /* Json | Null*/ #urlData = null;
    
    
    // Class constants

    /* String */ #GET = "GET";
    /* String */ #POST = "POST";
    /* String */ #PUT = "PUT";
    /* String */ #DELETE = "DELETE";



    /* Custom errors of module */
    #notObjectReceivedException = class extends Error { }
    #headersWasNotObject = class extends Error { };
    #targetUrlWasNotAnString = class extends Error { };
    #dataArgumentWasNotJsonObject = class extends Error { };
    #urlDataArgumentWasNotJsonObject = class extends Error { };
    #dataArgumentInGetRequest = class extends Error { };

    constructor(/* Json | Any */ objectConfig) {

        //Check if the argument is a Json object
        if (this.#checkIfObjectIsJson(objectConfig)) {

            let /* Array<String> */ keysOfObject = Object.keys(objectConfig);

            let /* String */ currentObjectValue = "";
            //For each key, check and put valid values in class's global variables
            keysOfObject.forEach(key => {
                currentObjectValue = objectConfig[key];
                switch (key) {
                    case HEADERS:

                        // Check if the passed argument is json, if yes, push to class's global variables
                        if (this.#checkIfObjectIsJson(currentObjectValue)) {
                            this.#headers = currentObjectValue;
                        }
                        else {
                            this.#throwSomeException(this.#headersWasNotObject, "You need pass an valid json object as headers argument");
                        }

                        break;
                   
                    case URL:

                        // An url can only be a string
                        if (typeof (currentObjectValue) == "string") {
                            this.#targetUrl = currentObjectValue;
                        }
                        else {
                            // If not string, throw the correct exception
                            this.#throwSomeException(this.#targetUrlWasNotAnString, "The url only accept content of string type");
                        }
                        break;

                    case DATA:

                        // The data only can be json object
                        if (this.#checkIfObjectIsJson(currentObjectValue)) {
                            this.#data = currentObjectValue
                        }
                        else {
                            // If not, throw the correct exception
                            this.#throwSomeException(this.#dataArgumentWasNotJsonObject, "You need pass an valid json object to the data");
                        }

                        break;
                    case URL_DATA:
                        
                        // The Url only can be json object
                        if(this.#checkIfObjectIsJson(currentObjectValue)){
                            this.#urlData = currentObjectValue;
                        }
                        else{
                            // If not, throw the correct exception
                            this.#throwSomeException(this.#urlDataArgumentWasNotJsonObject,"You need pass an valid json object to url data argument");
                        }
                        break;
                }
            })
        }
        else {
            // If not, throw the necessary exception
            this.#throwSomeException(this.#notObjectReceivedException, "The argument passed as config need be an Json Object;")
        };

    }

    // Get request method
    get(callback) {
        // Check if some necessary info to make the request are filled;
        if (this.#data != null) {
            this.#throwSomeException(this.#dataArgumentInGetRequest, "You can't pass data for get method request");
        }
        else {
            if (this.#checkAllSourcesBeforeRequest()) {
                this.#doHttpRequest(this.#targetUrl,this.#urlData, this.#data, this.#headers, this.#GET, callback);
            }
        }
    }

    // Post request method
    post(callback) {
        if (this.#checkAllSourcesBeforeRequest()) {
            this.#doHttpRequest(this.#targetUrl,this.#urlData,this.#data, this.#headers, this.#POST, callback);
        }
    }

    // Delete request method
    delete(callback){
        if(this.#checkAllSourcesBeforeRequest()){
            this.#doHttpRequest(this.#targetUrl,this.#urlData, this.#data, this.#headers, this.#DELETE, callback);
        }
    }

    // Put request method
    put(callback){
        if(this.#checkAllSourcesBeforeRequest()){
            this.#doHttpRequest(this.#targetUrl,this.#urlData,this.#data, this.#headers, this.#PUT, callback);
        }
    }

    /* Bool */ #checkAllSourcesBeforeRequest() {
        if (this.#targetUrl != null) {
            return true
        }
        else {
            return false;
        }
    }

    #doHttpRequest(requestUrl,requestUrlData, requestData, requestHeaders, requestMethod, callback) {
        /*
            On fetch statement is not possible to put data arguments on the
            get request for example, each request method need be splitted in your code segment
        */

        let /* FormData */ possibleFormData = requestData == null ? new FormData() : this.#transformJsonToFormData(requestData);
        let /* Headers */ possibleHeaders = requestHeaders == null ? new Headers() : this.#transformJsonToHeaders(requestHeaders);

        requestUrl += requestUrlData == null ? "" : this.#transformJsonURLdataToURLstring(requestUrlData);

        //  Check if the method is GET.
        if (requestMethod == this.#GET) {
            let /* Promise */ resultAsPromise = fetch(requestUrl, {
                method: requestMethod,
                headers: possibleHeaders
            });

            // Process the promise and execute callback, to avoid DRY
            this.#handleFetchPromise(resultAsPromise, callback);
        }

        // Check if the method is POST
        if (requestMethod == this.#POST) {
            let resultAsPromise = fetch(requestUrl, {
                method: requestMethod,
                headers: possibleHeaders,
                body: possibleFormData
            });

            // Process the promise and execute callback, to avoid DRY
            this.#handleFetchPromise(resultAsPromise,callback);
        };

        // Check if the method is DELETE
        if(requestMethod == this.#DELETE){

            let /* Promise */ resultAsPromise = fetch(requestUrl,{
                method : requestMethod,
                body : possibleFormData,
                headers: possibleHeaders
            });

            // Process the promise and execute callback, to avoid DRY
            this.#handleFetchPromise(resultAsPromise,callback);
        };

        // Check if the method is PUT
        if(requestMethod == this.#PUT){
            let /* Promise */ resultAsPromise = fetch(requestUrl,{
                method : requestMethod,
                body : possibleFormData,
                headers : possibleHeaders
            });

            this.#handleFetchPromise(resultAsPromise,callback);
        };
    };

    // It's to avoid DRY, and give the responsability of execute the user code to only a function
    /*Void */ #executeUserCallback(/* Null | String */ possibleError,/* Null | Json */ possibleResponse, callback) {
        callback(possibleError, possibleResponse);
    };

    /* String */ #transformJsonURLdataToURLstring(/* Json */ dataAsJson){
        let /* Array<String> */ jsonKeys = this.#getKeysOfObject(dataAsJson);
        let /* String */ finalString = "?";
        
        let /* Number */ count = 0;
        jsonKeys.forEach(key => {
            if(count < jsonKeys.length - 1){
                finalString += `${key}=${dataAsJson[key]}&`;
            }
            else{
                finalString += `${key}=${dataAsJson[key]}`;
            }
            count++;
        })

        return encodeURI(finalString);
        
    }

    #handleFetchPromise(/* Promise */ fetchResult, callback){
        fetchResult.then((Response) => {
            Response.text().then((responseAsString) => {

                //Put all results inside a only object, it's more easy to the user access it
                let collectionOfTheResponse = this.#createCollectionOfResponseData(Response.headers, Response.status, responseAsString);

                // It's a sucess, then pass error as null and the response as json object
                this.#executeUserCallback(null, collectionOfTheResponse, callback);
            })

        }).catch((Error) => {
            // It's a error, then pass the cause and the response as null
            this.#executeUserCallback(Error, null, callback);
        });
    }

    #createCollectionOfResponseData(responseHeaders, responseStatus, responseText) {

        let collectionOfTheResponse = {
            headers: responseHeaders,
            status: responseStatus,
            text: responseText
        }
        return collectionOfTheResponse;

    };

        /* Headers */ #transformJsonToHeaders(/* Json */ headersAsJson) {

        let /* Array<String> */ jsonKeys = this.#getKeysOfObject(headersAsJson);
        let /* Headers */ requestHeaders = new Headers();
        // For each key, write your content into Headers type variable
        jsonKeys.forEach(key => {
            requestHeaders.append(key, headersAsJson[key]);
        });

        return requestHeaders;

    };

        /* FormData */ #transformJsonToFormData(/* Json */ dataAsJson) {
        let /* Array<String> */ jsonKeys = this.#getKeysOfObject(dataAsJson);
        let requestForm = new FormData();

        // For each key, write your content into FormData type variable
        jsonKeys.forEach(key => {
            requestForm.append(key, dataAsJson[key]);
        })

        return requestForm;
    }

    //Method to extract all keys of object, and return it, to avoid DRY
        /* Array<String> */ #getKeysOfObject(/* Json */ objectToExtract) {
        return Object.keys(objectToExtract);
    };

        /* Bool */ #checkIfObjectIsJson(/* Json | Any */ suspiciousObject) {
        try {
            let /* Any */ varType = typeof (suspiciousObject);
            if (varType == "object" && !Array.isArray(suspiciousObject) && varType != null && varType != undefined) {

                //Everything looks ok, then true;
                return true;
            }
            else {
                // If not, then false
                return false;
            }
        }
        catch (exc) {
            //Something is wrong, then false
            return false;
        };
    };

    /* Void */ #throwSomeException(/* Exception */ exceptionToThrow,/* String */ message) {
        throw new exceptionToThrow(message);
    };
};