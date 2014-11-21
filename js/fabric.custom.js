var CustomFabric = (function(){

		var _info = new Object();
		var _canvas;
		var _cropstate = {};
		_cropstate.area = false;

		return {
			withURL : function(url) {
				_info.url = url;
				return this;
			},			
			setCanvas : function(canvas){
				_canvas = canvas;
			},
			getCanvas : function(){
				return _canvas;
			},
			resizeCanvas : function(selector){
				
				$(window).resize(function(){

					var wrapper = $(selector);
					
					var width = wrapper.width();
					var height = wrapper.height();

					_canvas.setWidth(width);
					_canvas.setHeight(height);

					canvas.renderAll();

				})

			},
			_getActiveObject : function(obj){

				if( obj == null){
					obj = _canvas.getActiveObject();

					if(obj == null){
						obj = this.getImageObject();
					}

				}

				return obj;

			},
			// youtube using Yahoo YQL
			_parseContent : function(data, contentType) {
				
				if(contentType == "youtube"){
					data = data.query.results.json;					
					return data;
				}else{
					return data;
				}
			},
			loadImage : function(success, error) {
				var contentURL = _info.url;
				var contentType = "";

				if(contentURL.indexOf("youtu") != -1){				
					contentType = "youtube";		
				} else if(contentURL.indexOf("vimeo") != -1){										
					contentType = "vimeo";
				} else if(contentURL.indexOf("flic") != -1){
					contentType = "flickr";
				} else if(contentURL.indexOf("insta") != -1){				
					contentType = "instagram";
				}

				var _customFabric = this;

				contentResource()
				.withType(contentType)
				.withURL(contentURL)
				.searchContent(function(data){

					if(success != null){
						data = _customFabric._parseContent(data,contentType);						
						success(data);	
					}
					

				}),function(err){
					if(error != null){
						error(err);
					}
					
				};

			},
			getImageObject : function(){
	
				var imgObj = null;
				
				_canvas.getObjects().map(function(obj){
					if(obj.isType("image")) imgObj = obj; 		
				});
				
				return imgObj;
			},
			rotateObject : function(angleOffset) {

				var obj = this._getActiveObject(), resetOrigin = false;

			    if (!obj) return;

			    var angle = obj.getAngle() + angleOffset;

			    if ((obj.originX !== 'center' || obj.originY !== 'center') && obj.centeredRotation) {
			        obj.setOriginToCenter && obj.setOriginToCenter();
			        resetOrigin = true;
			    }

			    angle = angle > 360 ? 90 : angle < 0 ? 270 : angle;

			    obj.setAngle(angle).setCoords();

			    if (resetOrigin) {
			        obj.setCenterToOrigin && obj.setCenterToOrigin();
			    }

			    _canvas.renderAll();

			},
			rotateSymmetry : function(){
				var activeObject = this._getActiveObject();
				if(activeObject.getFlipX()){
					activeObject.setFlipX(false);	
				}else{
					activeObject.setFlipX(true);
				}

				_canvas.renderAll();
				
			},
			getInitScale : function(obj){

				var activeObject = this._getActiveObject(obj);
				var objectScale = activeObject.getScaleX();
				var initScale = (10 / (objectScale * 10));

				return initScale;

			},
			changeScale : function(objScale, obj){
 				
 				obj = this._getActiveObject(obj);

 				objScale = (Math.round(objScale * 10) / 10 );


 				if(objScale <= 0.2 || objScale >= 10){
 					return;
 				};

 				obj.set({
 					centeredScaling : true,
					scaleX : objScale,
					scaleY : objScale,
				});



 				obj.setCoords();

 				_canvas.renderAll();
				
			},
			upScale : function(scale, obj){

				obj = this._getActiveObject(obj);
 				initScale = obj.getScaleX();

 				this.changeScale(initScale + scale, obj);


			},
			downScale : function(scale, obj){

				obj = this._getActiveObject(obj);
				initScale = obj.getScaleX();

 				this.changeScale(initScale + scale, obj);

			},
			addRect : function(opt){
				_canvas.add(new fabric.Rect(opt));				
			},
			addCircle : function(opt){
				_canvas.add(new fabric.Circle(opt));
			},
			addTriangle : function(opt){
				_canvas.add(new fabric.Triangle(opt));
			},
			showImgCropArea : function(){

				if(!(_cropstate.area)){

					var imgObj = this.getImageObject();

					cropArea = new fabric.Rect({
			            fill: 'rgba(0,0,0,0.3)',
			            originX: 'left',
			            originY: 'top',
						stroke: '#444',
				        strokeDashArray: [5, 5],
			            opacity: 1.0,
			            borderColor: '#444',
			            cornerColor: '#444',            
			            hasRotatingPoint: false,
			            scaleX: 1,
			            scaleY: 1,
			            name : 'crop_area',
			            left : imgObj.getLeft() + Math.round((imgObj.getWidth() / 5)),
			            top : imgObj.getTop() + Math.round((imgObj.getHeight() / 5)),
						width : Math.round((imgObj.width * imgObj.getScaleX() ) / 2),
						height : Math.round((imgObj.height * imgObj.getScaleY() ) / 2)
			        });

					_cropstate.area = true;
					_cropstate.rect = cropArea;


					var _this = this;
					cropArea.on('object:dblclick', function(option){
						_this.actionCropArea(option);	
					});

					_canvas.add(cropArea);


				} else{

					_cropstate.area = false;
					_canvas.remove(_cropstate.rect);
					
				}
				


			},
			actionCropArea : function(option){

				var imgObj = this.getImageObject();
				var cropArea = _cropstate.rect;

				if(cropArea.intersectsWithObject(imgObj) || cropArea.isContainedWithinObject(imgObj) ){


					var imgLeft = imgObj.getLeft();
					var imgTop = imgObj.getTop();
					var imgWidth = imgObj.getWidth();
					var imgHeight = imgObj.getHeight();
					
					var cropAreaLeft = cropArea.getLeft();
					var cropAreaTop = cropArea.getTop();
					var cropAreaWidth = cropArea.getWidth();
					var cropAreaHeight = cropArea.getHeight();
					
					var newLeft;
					var newTop;
					var newWidth;
					var newHeight;

					newLeft = (cropAreaLeft < imgLeft ? imgLeft : cropAreaLeft);
					newTop = (cropAreaTop < imgTop ? imgTop : cropAreaTop);
					newWidth = (cropAreaLeft+cropAreaWidth > imgLeft+imgWidth ? imgLeft+imgWidth - newWidth : cropAreaLeft+cropAreaWidth - newWidth);
					newHeight = (cropAreaTop+cropAreaHeight > imgTop+imgHeight ? imgTop+imgHeight - newHeight : cropAreaTop+cropAreaHeight - newHeight);
		

					_canvas.forEachObject(function(canvasObj){
						if(!canvasObj.isType("image"))
							_canvas.remove(canvasObj);
					});

					var newImage = new Image();

					newImage.src = _canvas.toDataURL({
				        left: newLeft,
				        top: newTop,
				        width: parseInt(newWidth),
				        height: parseInt(newHeight),
				    });


					newImage.onload = function(){

						var imgInstance = new fabric.Image(this);

						var imgWidth = parseInt( imgInstance.getWidth() / scale );
				 	    var imgHeight = parseInt( imgInstance.getHeight() / scale );
				 	    
				 	    imgInstance.set({
				 	    	width : imgWidth,
				 	    	height : imgHeight,
				 	    	scaleX : 1,
				 	    	scaleY : 1
				 	    });

				 	    canvas.remvoe(imgObj);
				 	    canvas.add(imgInstance);

				 	    canvas.renderAll();

				 	    _cropstate.area = false;

					}


				}else{

					_cropstate.area = false;
					_canvas.remove(_cropstate.rect);
					
				}



			}

		
			
		}

	});