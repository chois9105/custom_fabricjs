var contentResource = (function(){
		var parameters = {};
		var success = null;
		var error = null;
		
		return {
			
			withType : function(type){
				parameters.type = type;
				return this;
			},			
			withURL : function(url){
				parameters.url = url;				
				return this;
			},
			searchContent : function(successCallback, errorCallback){
				
				if(successCallback)
					success = successCallback;
				if(errorCallback)
					error = errorCallback;
				
				if( parameters.type == "youtube" ){
					this.searchYoutube(success, error);
				} else if(parameters.type == "vimeo"){
					this.searchVimeo(success, error);
				} else if(parameters.type == "flickr"){
					this.searchFlickr(success, error);
				} else if (parameters.type == "instagram"){
					this.searchInstagram(success, error);
				}
				
			},
			searchYoutube : function(successCallback, errorCallback){

				
				$.ajax({
		            url: 'http://query.yahooapis.com/v1/public/yql',
		                data: {
		                    q: "select * from json where url ='http://www.youtube.com/oembed?url=" + encodeURI(parameters.url) + "&format=json'",
		                    format: "json"
		                },
		                dataType: "jsonp",
		            success: success,
		            error: error
		        });
				
			},
			searchVimeo : function(successCallback, errorCallback){
				
				$.ajax({
					url: 'http://vimeo.com/api/oembed.json?url=' + encodeURI(parameters.url),	                	           
		            success: success,
		            error: error
				});				
			},
			searchFlickr : function(successCallback, errorCallback){
				
				$.ajax({
			        type: "GET",
			        url: "http://www.flickr.com/services/oembed/?url=" + encodeURI(parameters.url) + "&format=json&jsoncallback=?",
			        cache: 'true',
			        dataType: "jsonp",			        
			        success: success,
			        error: error
			    });
				
			},			
			searchInstagram : function(successCallback, errorCallback){				
				
				$.ajax({
					type: "GET",
					url: "http://api.instagram.com/oembed?url=" + encodeURI(parameters.url),
					cache: 'true',
			        dataType: "jsonp",
			        success: success,
			        error: error
				});			
				
			}
		}
	});