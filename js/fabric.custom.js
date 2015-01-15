var CustomFabric = (function(){

		var _info = new Object();
		var _canvas;
		var _cropstate = {};
		var _textPanel = '';
		var _shapePanel = '';
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
			setTextPanel : function(panel){
				_textPanel = panel
			},
			getTextPanel : function(){
				return _textPanel;
			},
			setShapePanel : function(panel){
				_shapePanel = panel
			},
			getShapePanel : function(){
				return _shapePanel;
			},
			resizeCanvas : function(selector){
				
				$(window).resize(function(){

					var wrapper = $(selector);
					
					var width = wrapper.width();
					var height = wrapper.height();

				
					_canvas.setWidth(width);
					_canvas.setHeight(height);

					_canvas.renderAll();

				})

			},
			getActiveObject : function(){
				return this._getActiveObject();
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
			renderAll : function(){
				return _canvas.renderAll();
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
				} else{
					contentType = "local";
				}

				if(contentType == "local"){
					fabric.Image.fromURL(contentURL,function(img){
						img.set({
							crossOrigin : 'anonymous'
						})
		
						_canvas.add(img)
					})


				}else{

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

				}
				

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


 				if(objScale <= 0.2 || objScale >= 2){
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
			addOutlineRext : function(){
				_canvas.add(new fabric.Rect(opt));
			},
			addCircle : function(opt){
				_canvas.add(new fabric.Circle(opt));
			},
			addTriangle : function(opt){
				_canvas.add(new fabric.Triangle(opt));
			},
			addText : function(opt){
				_canvas.add(new fabric.Text(opt));
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
				imgObj.set({
					'crossOrigin' : 'anonymous'
				})
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
					newWidth = (cropAreaLeft+cropAreaWidth > imgLeft+imgWidth ? imgLeft+imgWidth - newLeft : cropAreaLeft+cropAreaWidth - newLeft);
					newHeight = (cropAreaTop+cropAreaHeight > imgTop+imgHeight ? imgTop+imgHeight - newTop  : cropAreaTop+cropAreaHeight - newTop);
	
					_canvas.forEachObject(function(canvasObj){
						if(!canvasObj.isType("image"))
							_canvas.remove(canvasObj);
					});


					var newImage = new Image();
					var src = imgObj.getSrc();
					newImage.setAttribute('crossOrigin', 'anonymous');
	

					newImage.src = _canvas.toDataURL({
				        left: newLeft,
				        top: newTop,
				        width: newWidth,
				        height: newHeight
				    });

					newImage.onload = function(){

						var imgInstance = new fabric.Image(this);

				 	    _canvas.remove(imgObj);
				 	    _canvas.add(imgInstance);
				 	    _canvas.renderAll();
				 	    _cropstate.area = false;

					}


				}else{

					_cropstate.area = false;
					_canvas.remove(_cropstate.rect);
					
				}



			},			
			changeBrightness : function(value){

				if(value == null){
					return;
				}

				var imgObj = this.getImageObject();

				if (!imgObj.filters[5]) {
					var filter = new fabric.Image.filters.Brightness({brightness: value});
					imgObj.filters[5] = filter;
				}
				else {
					var brightnessValue = imgObj.filters[5].brightness;
					brightnessValue += value;
					imgObj.filters[5].brightness = brightnessValue;	
				};

			    imgObj.applyFilters(_canvas.renderAll.bind(_canvas));

			},
			changeGrayscale : function(){
				var imgObj = this.getImageObject();
				var grayscale = imgObj.filters[0];
				var filter = (  (grayscale != undefined && grayscale != false) ? false : new fabric.Image.filters.Grayscale());
				
				imgObj.filters[0] = filter;
				imgObj.applyFilters(_canvas.renderAll.bind(_canvas));


			},
			on : function(evt, func){
				_canvas.on(evt, func);
			}

		}

	});
