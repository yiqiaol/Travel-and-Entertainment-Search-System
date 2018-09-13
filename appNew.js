const http= require('http');
const https= require('https');
const urll = require('url');


const util = require('util');
//nearby search
http.createServer(function(req, res){
    res.setHeader("Access-Control-Allow-Origin", "*");  
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");  
    res.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
    res.setHeader("Content-Type", "application/json;charset=utf-8");
    var params = urll.parse(req.url, true).query;
	var url = req.url.substring(1);

	console.log(url);
	if(url.indexOf("location") > 0||url.indexOf("pagetoken")>0){
		var pathURL = '/maps/api/place/nearbysearch/json'+url+'&key=AIzaSyChvP9u9AHVCfUWWInRX_yLhiOhmeHWiGk';
		var options = {
		  hostname: 'maps.googleapis.com',
		  path: pathURL
		};	
		var locationRequest = https.request(options, (response) => {		
			  var locationsRes = "";
			  response.on('data', (chunk) => {
			    locationsRes += chunk;
			  });
			  response.on('end', () => {
			    res.end(locationsRes);
			  });
		});
	    locationRequest.end();
	}else if(url.indexOf("placeid")>0)
	{
		
		var pathURL = '/maps/api/place/details/json'+url+'&key=AIzaSyDMuWlAfl6QXZIsCp_SDCkCfhmkXNxMfVE&language=en';
		var options = {
		  hostname: 'maps.googleapis.com',
		  path: pathURL
		};	
		var locationRequest = https.request(options, (response) => {		
			  var locationsRes = "";
			  response.on('data', (chunk) => {
			    locationsRes += chunk;
			  });
			  response.on('end', () => {
			    res.end(locationsRes);
			  });
		});
	    locationRequest.end();

	}
	else if(url.indexOf("Location") > 0){

	    	keyword = params.keyword;
			type = params.type;
			distance = params.radius;
			pathURL = '/maps/api/geocode/json?address=' + encodeURI(params.Location) + '&key=AIzaSyDX-cBo7DQYKHNauCOxDQ--7k0DsRJYmgk';
 
	    	var options = {
			  	hostname: 'maps.googleapis.com',
			  	path: pathURL
			};

			var geoRequest = https.request(options, (response) => {
				var theLocation = "";

				response.on('data', (chunk) => {
				    theLocation += chunk;
				});

				response.on('end', () => {
					console.log("the location:"+ theLocation);
					theLocation = JSON.parse(theLocation);					
					lat = theLocation.results[0].geometry.location.lat;  
	    			lng = theLocation.results[0].geometry.location.lng;	
	    			pathURL = '/maps/api/place/nearbysearch/json?location=' + lat + "," + lng + "&radius=" + distance + '&type=' +  encodeURI(type) + '&keyword=' + encodeURI(keyword) + '&key=AIzaSyChvP9u9AHVCfUWWInRX_yLhiOhmeHWiGk';  			
					var options = {
					  	hostname: 'maps.googleapis.com',
					  	path: pathURL
					};
					var locationRequest = https.request(options, (response) => {
						var locationsRes = "";
						response.on('data', (chunk) => {
						    locationsRes += chunk;
						});

						response.on('end', () => {					
							res.end(locationsRes);
						});
					});
				    locationRequest.end();	
				});
			});
		    geoRequest.end();
	    





	}else if(url.indexOf("address1") > 0){
		var pathURL = '/v3/businesses/matches/best'+url;
	
		var options = {
		  hostname: 'api.yelp.com',
		  headers:{
	     	 'Authorization': 'Bearer sFt_Y5xoz4Bdsq0-ZAnlAnC_MtuZtlE68Kh1OwbTrDHJvZRuBCjVtLMsMc8g89IptSeDTfsoxLKxzr11Eo866vt2msjNE_jUN8kxlT7YIq0unwW19Y_lob8wYoXEWnYx'
	      },
		  path: pathURL
		};	
		var locationRequest = https.request(options, (response) => {		
			var locationsRes = "";
			response.on('data', (chunk) => {
			  locationsRes += chunk;
			});
			response.on('end', () => {
			  // res.end(locationsRes);
			  
			  //check if it is what we want
			  // console.log(JSON.parse(locationsRes).businesses);
			  if(JSON.parse(locationsRes).businesses.length != 0){
			  	  id = JSON.parse(locationsRes).businesses[0].id;
				  var pathURL = '/v3/businesses/'+id +"/reviews";
				
				  var options = {
				    hostname: 'api.yelp.com',
				    headers:{
				      'Authorization': 'Bearer sFt_Y5xoz4Bdsq0-ZAnlAnC_MtuZtlE68Kh1OwbTrDHJvZRuBCjVtLMsMc8g89IptSeDTfsoxLKxzr11Eo866vt2msjNE_jUN8kxlT7YIq0unwW19Y_lob8wYoXEWnYx'
				    },
				    path: pathURL
				  };	
				  var locationRequest = https.request(options, (response) => {		
					    var locationsRes = "";
					    response.on('data', (chunk) => {
					      locationsRes += chunk;
					    });
					    response.on('end', () => {
					      // console.log(locationsRes);
					      res.end(locationsRes);

					    });
				  });
			      locationRequest.end();
			  }else{
			  	res.end(JSON.stringify(locationsRes));
			  }
		  });
		});
	    locationRequest.end();
	}else{
		res.end("Hello World");
	}
	

//}).listen(8081);
}).listen(3000);

