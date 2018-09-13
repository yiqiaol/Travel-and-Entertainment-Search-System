


var directionsDisplay;
var directionsService;
var panorama;
var autocomplete;
var autocomplete1;
var searchNearby;
var nextToken;
var pageIndex;
var partial_results;
var results;  
var favPageIndex;
var yelpMatch;
var rate;
  

function initAutocomplete() {	
	//form
	autocomplete = new google.maps.places.Autocomplete(
	    (document.getElementById('autocomplete')),
	    {types: ['geocode']});
	autocomplete.addListener('place_changed', function() {         
          userplace = autocomplete.getPlace();
          console.log(userplace);
          if (!userplace.place_id) {
            return;
          }
      });
	//map from input
	autocomplete1 = new google.maps.places.Autocomplete(
	    (document.getElementById('autocomplete1')),
	    {types: ['geocode']});
}
function toggleStreetView() {
	var toggle = panorama.getVisible();
	if (toggle == false) {
	  panorama.setVisible(true);
	  $("#changeView").attr("src","http://cs-server.usc.edu:45678/hw/hw8/images/Map.png");
	  console.log("street");
	} else {
	  panorama.setVisible(false);
	  $("#changeView").attr("src","http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png");
	  console.log("map");
	}
}

//angularjs
var app = angular.module('myApp',['ngAnimate']);
app.controller('myCtrl', function($scope, $http) {
	//get location
	
	$scope.Catagory ="default";
	$scope.transport = "DRIVING";
	$scope.Distance = "10";
	$scope.locations = []; //not used
	$scope.fav = [];
	$scope.showlist = true;
	$scope.showdetail = true;

	$scope.getdetail = true;
	$scope.fromPlace = "Your location";
	$scope.barShow = false;
	$scope.detailButtonValid = true;
	$scope.isSelectedPlace = null;
	$scope.isSelectedfav  = null;
	$scope.detailfav = false;

	$scope.getLocation = false;
	
    $scope.isYelp = false;
	
    $scope.ani = false;
    $scope.starWidth = 0;
    $scope.choice = 'here';
    $scope.fail = false;
    $http({
        method: 'GET',
        url: 'http://ip-api.com/json',
        params:{}
    }).then(function successCallback(response) {
    	$scope.getLocation = true;
        latLoc = response.data.lat;
        lngLoc = response.data.lon;
        console.log(latLoc+"," +lngLoc);
        }, function errorCallback(response) {
    });
   	
   	
    $scope.openNewWin = function(url){
    	window.open(url);
    	console.log("new window");
    }

    $scope.getresult = function(){
    	//get the table
	    results = [];        
	    partial_results = [];
    	searchNearby = 'http://csci571-env.527xpsyva4.us-east-2.elasticbeanstalk.com/?location='+encodeURI(latLoc+','+lngLoc)+"&keyword="+$scope.Keyword+"&type="+$scope.Catagory+"&radius="+$scope.Distance*1600;
       //searchNearby = 'http://127.0.0.1:3000/?location='+encodeURI(latLoc+','+lngLoc)+"&keyword="+$scope.Keyword+"&type="+$scope.Catagory+"&radius="+$scope.Distance*1600;
      
      
    	console.log(searchNearby);
    	$http({
	        method: 'GET',
	        url: searchNearby
	    }).then(function successCallback(response) {  
	    	 
	    	 console.log(response);
	    	 console.log($scope.barShow);  

             results = response.data.results;
             if(!result){ //no list records
                $scope.noLists = true;
             }else{
                 nextToken = response.data.next_page_token;
                 if(nextToken){
                 	$scope.nextItem = true;
                 }else{
                 	$scope.nextItem = false;
                 }
                 pageIndex = 0;
                 if(pageIndex == 0){
                 	$scope.prevItem = false;
                 }
                 start = pageIndex*20;
                 // renew the partial
                 largest = (results.length-start)<20?(results.length-start):20;
                 for(var i = 0; i< largest;i++){
                 	partial_results[i] = results[start+i];
                 }
                 $scope.partial = partial_results;
                 $scope.showdetail = false;
            	 $scope.showlist= true;
                 $scope.noLists = false;
                 $scope.barShow = false;

             }
             //animation variable        
            
	        }, function errorCallback(response) {
                 $scope.fail = true;
	    });
    }

    $scope.submit = function(){
        $scope.ani = false;
    	//show progress bar
    	$scope.barShow = true;
       
    	
    	//update the new location(from)
    	//Option2:  geocoding the user input
    	if($scope.choice == 'here'){ //current location	
            $scope.fromPlace = "Your location";	
    		$scope.getresult();

    	}else{                    //user input location
    		$scope.fromPlace = $("#autocomplete").val();
            
            $scope.getresult();
    	}
	
    }
    $scope.getPreviouspage = function(){
    	pageIndex--;
    	if(pageIndex < 0){
    		pageIndex = 0;
    	}
    	start = pageIndex*20;
    	largest = (results.length-start)<20?(results.length-start):20;
         for(var i = 0; i< largest;i++){
         	partial_results[i] = results[start+i];
         }
         if(pageIndex==0){
         	$scope.prevItem = false;
         }
         $scope.nextItem = true; 
         $scope.partial = partial_results;
         
    }
    // getNextPage
    $scope.getnextpage = function(){
    	pageIndex++;
    	if(pageIndex>=2){
    		pageIndex = 2; 
    		$scope.nextItem = false;
	    }   
        $scope.prevItem = true;
        
    	start = pageIndex*20; 
    	//case1: have next page info
    	if(results.length > start){ 
    		//renew the partial_results            
            largest = (results.length-start)<20?(results.length-start):20;
	    	for(var i = 0; i< largest;i++){
		    	partial_results[i] = results[start+i];
		    }
		    $scope.partial = partial_results;
    	}else if(nextToken){ //case2: have token
    		next = 'http://Csci571-env.527xpsyva4.us-east-2.elasticbeanstalk.com/?pagetoken='+nextToken;
           // next = 'http://127.0.0.1:3000/?pagetoken='+nextToken;
			$http({
		        method: 'GET',
		        url: next
		    }).then(function successCallback(response) {
		    	results = results.concat(response.data.results);
	            nextToken = response.data.next_page_token;	
	            largest = (results.length-start)<20?(results.length-start):20;
		    	for(var i = 0; i< largest;i++){
			    	partial_results[i] = results[start+i];
			    }
			    $scope.partial = partial_results;
			    console.log($scope.partial);    
			   }, function errorCallback(response) {
		    });   	
    	}
    }
    // favorite on-click function
    $scope.favorite = function(placeDetail){  
    	
    	if(!localStorage.hasOwnProperty(placeDetail.place_id)){ //not exist
    		favoritePlace = JSON.stringify(placeDetail);
    		localStorage.setItem(placeDetail.place_id,favoritePlace);
    		$scope.detailfav = true;
    		$scope.isSelectedfav = placeDetail; //save the recent fav one  		
    	}else{
    		console.log("add error");
    		$scope.detailfav = false;

    	}
    }
    // get fav info from local storage
    favPageShow = function(){
    	$scope.fav=[];
    	if(favPageIndex < Math.floor(localStorage.length/20)){ //not the last page
    		favmax = 20;  
    		if(favPageIndex == 0){
    			$scope.preFavButton = false;			
    		}else{
    			$scope.preFavButton = true;
    		}
    		$scope.nextFavButton = true; 		
    	}else{                                                //the last page
    		favmax = localStorage.length%20;
    		if(favPageIndex == 0){
    			$scope.preFavButton = false;
    		}else{
    			$scope.preFavButton = true;
    		}
    		$scope.nextFavButton = false; 		
    		//case1: favmax == 0
    		// if(favmax==0){                               
    		// 	favPageIndex--;
    		// 	favmax=20;
    		// 	if(favPageIndex == 0){
	    	// 		$scope.preFavButton = false;			
	    	// 	}else{
	    	// 		$scope.preFavButton = true;
	    	// 	}
	    	// 	$scope.nextFavButton = true; 	
    		//}else{
    			// if(favPageIndex == 0){
    			// $scope.preFavButton = false;
	    		// }else{
	    		// 	$scope.preFavButton = true;
	    		// }
	    		// $scope.nextFavButton = false; 		
    		//}   		
    	}    	
    	for(var i=0; i<favmax;i++){
    		var favs = JSON.parse(localStorage.getItem(localStorage.key(20*favPageIndex+i)));   		
	     	$scope.fav[i] = favs;
		}
    }
    $scope.getFavorite = function(){  
    	   	
    	favPageIndex = 0;   	
    	favPageShow();  
    	  	
    }
    $scope.nextFav = function(){
    	favPageIndex++;     	
    	if(favPageIndex>2){
    		favPageIndex = 2;
    	}
    	favPageShow();
    }
    $scope.prevFav = function(){
    	favPageIndex--;
    	$scope.fav = [];
    	if(favPageIndex<0){
    		favPageIndex = 0;
    	}
    	//show
    	favPageShow();
    }
    //delete fav
    $scope.delFavorite = function(placeDetail){
    	localStorage.removeItem(placeDetail.place_id);
    	favPageShow();
		
    }
    //fav button list
    $scope.addfav = function(placeDetail){  	
		if(localStorage.hasOwnProperty(placeDetail.place_id)){
    		return true;
    	}else{
    		return false;
    	}		
    		
    }
    //click list button
    $scope.tolist = function(){
    	$scope.showlist = true;
    	$scope.showdetail = false;
    	// $scope.detailfav = false;
    }
    $scope.clear = function(){
        $scope.Keyword ="";
        $scope.Catagory ="default";
        $scope.transport = "DRIVING";
        $scope.Distance = "10";
        $scope.locations = []; //not used
        $scope.fav = [];
        $scope.showlist = true;
        $scope.showdetail = true;

        $scope.getdetail = true;
        $scope.fromPlace = "Your location";
    
        $scope.detailButtonValid = true;
        $scope.isSelectedPlace = null;
        $scope.isSelectedfav  = null;
        $scope.detailfav = false;
        $scope.barShow = false;

        $scope.choice = 'here';
        $scope.fail = false;
        
        
        $scope.isYelp = false;
        
        $scope.ani = false;
    }
    $scope.DetailButtonGet = function(){
        $scope.ani = true;
        $scope.showdetail = true;
        $scope.showlist= false;  
    }
    //get place's detail
    $scope.detail = function(placeDetail){	
        $scope.ani = true;
    	$scope.isSelectedPlace = placeDetail;
        // $scope.showdetail = true;
        // $scope.showlist= false;  
    	if(!directionsDisplay){
    		directionsDisplay = new google.maps.DirectionsRenderer;
    	}
    	if(!directionsService){
    		directionsService = new google.maps.DirectionsService;
    	}
    	//mylocation
    	myLatLng = new google.maps.LatLng(latLoc,lngLoc);
    	//the place location that we enter(to)
    	dest = placeDetail.geometry.location;

    	map = new google.maps.Map(document.getElementById('map'), {
            center: dest,
            zoom: 15,
            streetViewControl: false
        });
 
        //get place detail
        var service = new google.maps.places.PlacesService(map);        
        service.getDetails({
           placeId: placeDetail.place_id
        }, function(place, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
          	console.log(place);
          	$scope.twitter = "https://twitter.com/intent/tweet?text=Check out "+place.name+" located at "+place.vicinity+" . Website: "+ place.website+" #TravelAndEntertainmentSearch";
          	//twitter button is available
          	$scope.getdetail = false;
          	$scope.detailButtonValid = false;
          	// map and marker
            marker = new google.maps.Marker({
              map: map,
              position: placeDetail.geometry.location
            });
            //street view
            panorama = map.getStreetView();
	        panorama.setPosition(dest);
	        panorama.setPov(/** @type {google.maps.StreetViewPov} */({
	          heading: 265,
	          pitch: 0
	        }));
            //info part
            $scope.details = place;
            $scope.name = place.name+",";
            $scope.address = place.formatted_address;
            $scope.price = new Array(place.price_level);
            info_rate = parseFloat(place.rating);
            console.log(info_rate);


            // photos
            $scope.photos = place.photos;
            if(place.photos){
            	for(var i=0; i<place.photos.length; i++){
	            	$scope.photos[i] = place.photos[i].getUrl({'maxWidth': 500, 'maxHeight':500});
	            }
                $scope.nophotos = false;
            }else{
                $scope.nophotos = true;
            }
            
            //open hours
            var real = moment().utcOffset(place.utc_offset).format('dddd');
            $scope.openHour = place.opening_hours;
            if(place.opening_hours){
                var time = place.opening_hours.weekday_text;
                var openFlag = place.opening_hours.open_now;
                var week = new Array();
                var week1 = new Array();
                var week2 = new Array();
                var week3 = new Array();
                var index;
                for(var i = 0; i < time.length; i++){
                    var substring = time[i].split(": ");
                    week[i] = new Array(2)
                    week[i][0] = substring[0];
                    week[i][1] = substring[1];
                    if(real == substring[0]){
                        $scope.openHour = substring[1];
                        index = i;
                    }
                }
                $scope.week1 = week.slice(index,index+1);
                $scope.week2 = week.slice(index+1,time.length);
                $scope.week3 = week.slice(0,index);
                if(openFlag == true){
                    $scope.open = "Open now:";  
                }else{
                    $scope.open = "Closed";
                }
            }
            
            
        	//get yelp review
            for(var i = 0; i < place.address_components.length; i++){
                if(place.address_components[i].types[0] == "administrative_area_level_2"){
                    city = place.address_components[i].short_name;
                }else if(place.address_components[i].types[0] == "administrative_area_level_1"){
                    states = place.address_components[i].short_name;
                }      
            }
            console.log(city);
            console.log(states);
            
            yelpMatch = 'http://Csci571-env.527xpsyva4.us-east-2.elasticbeanstalk.com/?name='+encodeURI(place.name)+"&city="+encodeURI(city)+"&state="+encodeURI(states)+"&country=US&address1="+encodeURI(place.formatted_address);
            //yelpMatch = 'http://127.0.0.1:3000/?name='+encodeURI(place.name)+"&city="+encodeURI(city)+"&state="+encodeURI(states)+"&country=US&address1="+encodeURI(place.formatted_address);
            console.log(yelpMatch);
            $http({
                method: 'GET',
                url: yelpMatch
            }).then(function successCallback(response) { 
                 $scope.starWidth = Math.max($scope.starWidth, $(".text-rating").width());
                 $(".text-rating").width((info_rate/ 5.0) * $scope.starWidth);                    
                 console.log(response);
                
                 $scope.yelpReviews = response.data.reviews;

                 if($scope.yelpReviews != undefined){
                    for(var i = 0; i < $scope.yelpReviews.length; i++){
                        var rate = new Array(response.data.reviews[i].rating);
                        $scope.yelpReviews[i].rating = rate;        
                     }
                     $scope.noYelpRecords = false;
                 }else{
                    $scope.noYelpRecords = true;
                 }
                
                }, function errorCallback(response) {
            });

        	// Method1: google result
        	$scope.reviews = place.reviews;
        	$scope.searchMethod = "Google Reviews";
        	$scope.orderMethod = 'Default Order';
        	//get order method
        	$scope.orderByMe = function(x){
        		if(x=='default'){
        			$scope.myOrderBy = 'default';
                    $scope.yelpOrderBy = 'default';
        			$scope.orderMethod = 'Default Order';
         		}
        		if(x=='high-rating'){
        			$scope.myOrderBy = '-rating';
                    $scope.yelpOrderBy = '-rating';
        			$scope.orderMethod = 'Highest Rating';
        		}
        		if(x=='low-rating'){
        			$scope.myOrderBy = 'rating';
                    $scope.yelpOrderBy = 'rating';
        			$scope.orderMethod = 'Lowest Rating';
        		}
        		if(x=='latest'){
        			$scope.myOrderBy = '-time';
                    $scope.yelpOrderBy = '-time_created';
        			$scope.orderMethod = 'Most Recent';
        		}
        		if(x=='early'){
        			$scope.myOrderBy = 'time';
                    $scope.yelpOrderBy = 'time_created';
        			$scope.orderMethod = 'Least Recent';
        		}
        	}
            if(place.reviews){
                $scope.noGoogleRecords = false;      
                for(var i = 0; i < place.reviews.length; i++){
                    var rate = new Array(place.reviews[i].rating);
                    var time = moment('1970-01-01 00:00:00').add(place.reviews[i].time,'seconds').format();  
                    var day = time.split("T");
                    var time = day[1].split("-08");
                    $scope.reviews[i].time = day[0] + " " + time[0];
                    $scope.reviews[i].rating = rate;  
                }
            }else{
                $scope.noGoogleRecords = true;
            }
        	
            $scope.googleSearch = function(){
                $scope.searchMethod = "Google Reviews";
                
                $scope.isYelp = false;
            }
        	// Method2: yelp result
        	$scope.yelpSearch = function(){
                $scope.searchMethod = "Yelp Reviews";
               
                $scope.isYelp = true;	
                // $scope.noGoogleRecords = false;
        	} 
            $scope.showdetail = true;
            $scope.showlist= false;  
            $scope.$apply();
          
          }
        });
    } 

    $scope.getRoute = function(){
        directionsDisplay.setMap(map);   
        directionsDisplay.setPanel(document.getElementById('right-panel')); 
        
        if($("#autocomplete1").val() == "My location" || $("#autocomplete1").val() == "Your location"){
            myLatLng1 = myLatLng;
        }else{
            myLatLng1 = $("#autocomplete1").val();
        }
        calculateAndDisplayRoute(directionsService, directionsDisplay);

    }
    function calculateAndDisplayRoute(directionsService,directionsDisplay){
    	console.log("from point");
    	console.log(myLatLng1);
    	directionsService.route({
    		origin: myLatLng1,
            destination: dest,
            travelMode: $scope.transport,
            provideRouteAlternatives:true
    	}, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
            marker.setVisible(false);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
    }

})


