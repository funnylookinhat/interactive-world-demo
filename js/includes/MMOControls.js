

THREE.MMOControls = function (parameters) {
  
  this._camera = parameters.camera ? parameters.camera : null;
  this._character = parameters.character ? parameters.character : null;
  this._cameraRadius = parameters.radius ? parameters.radius : 15;
  this._domElement = parameters.domElement ? parameters.domElement : document;
  
  this._moveStartCallback = parameters.moveStartCallback ? parameters.moveStartCallback : (function () { /* NULL */ });
  this._moveStopCallback = parameters.moveStopCallback ? parameters.moveStopCallback : (function () { /* NULL */ });
  this._moveCallback = parameters.moveCallback ? parameters.moveCallback : (function () { /* NULL */ });
  this._moveCallbackDelta = parameters.moveCallbackDelta ? parameters.moveCallbackDelta : 50;
  if( this._camera == null ||
      this._character == null ) {
    console.log("Cannot be used without a character and camera.");
    return;
  }

  this._characterPositionOld = new THREE.Vector3(
    this._character.position.x,
    this._character.position.y,
    this._character.position.z
  );

  this._lastTime = Date.now();

  this._cameraTheta = 0; // Good 3rd Person Defaults
  this._cameraPhi = 0.3;
  
  // Basically - ground or top-down.
  this._minPhi = 0.01;
  this._maxPhi = Math.PI / 2;

  this._minCameraRadius = 0.1;

  this._defaultVelocity = 1;

  this._characterAngle = this._character.rotation.y;
  this._characterVelocity = 0.00;

  this._activeCenterKeys = {
    '87': false,
    '83': false,
    '65': false,
    '68': false
  };
  this._keyCenterMappings = {
    '87': [0,1],
    '83': [0,-1],
    '65': [-1,0],
    '68': [1,0]
  };
  this._vectorAngles = {
    '-1': {
      '-1': -3 * Math.PI / 4,
      '0': - Math.PI / 2,
      '1': -Math.PI / 4
    },
    '0': {
      '-1': -Math.PI,
      '0': false,
      '1': 0
    }, 
    '1': {
      '-1': 3 * Math.PI / 4,
      '0': Math.PI / 2,
      '1': Math.PI / 4
    } 
  }

  /*
  this._activeThetaKeys = {
    '81': false,
    '69': false
  };

  this._keyThetaMappings = {
    '81': 0.05,
    '69': -0.05
  };
  */

  /*
  this._activePhiKeys = {
    '82': false,
    '70': false
  };

  this._keyPhiMappings = {
    '82': 0.005,
    '70': -0.005
  };
  */
  
}

THREE.MMOControls.prototype.init = function () {
  var self = this;
  self._domElement.addEventListener( 'keydown' , function (event) {
    self._keyDown(event,self);
  }, false);
  self._domElement.addEventListener( 'keyup',  function (event) {
    self._keyUp(event,self);
  }, false);
  self._domElement.addEventListener( 'mousewheel', function (event) {
    self._mouseWheel(event,self);
  }, false );
  self._domElement.addEventListener( 'DOMMouseScroll', function (event) {
    self._mouseWheel(event,self);
  }, false );
}

THREE.MMOControls.prototype._keyDown = function (event, self) {
  /*
  if( typeof self._activeCenterKeys[event.keyCode.toString()] != "undefined" &&
      ! self._activeCenterKeys[event.keyCode.toString()] ) {
    self._activeCenterKeys[event.keyCode.toString()] = true;
    self._updateAcceleration();
  } else if( typeof self._activeThetaKeys[event.keyCode.toString()] != "undefined" &&
             ! self._activeThetaKeys[event.keyCode.toString()] ) {
    self._activeThetaKeys[event.keyCode.toString()] = true;
    self._updateTheta();
  } else if( typeof self._activePhiKeys[event.keyCode.toString()] != "undefined" &&
             ! self._activePhiKeys[event.keyCode.toString()] ) {
    self._activePhiKeys[event.keyCode.toString()] = true;
    self._updatePhi();
  } 
  */
}

THREE.MMOControls.prototype._keyUp = function (event, self) {
  /*
  if( typeof self._activeCenterKeys[event.keyCode.toString()] != "undefined" &&
      self._activeCenterKeys[event.keyCode.toString()] ) {
    self._activeCenterKeys[event.keyCode.toString()] = false;
    self._updateAcceleration();
  } else if( typeof self._activeThetaKeys[event.keyCode.toString()] != "undefined" &&
            self._activeThetaKeys[event.keyCode.toString()] ) {
    self._activeThetaKeys[event.keyCode.toString()] = false;
    self._updateTheta();
  } else if( typeof self._activePhiKeys[event.keyCode.toString()] != "undefined" &&
             self._activePhiKeys[event.keyCode.toString()] ) {
    self._activePhiKeys[event.keyCode.toString()] = false;
    self._updatePhi();
  } 
  */
}

THREE.MMOControls.prototype._mouseWheel = function (event, self) {
  var delta = 0;
  if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
    delta = - event.wheelDelta / 10;
  } else if ( event.detail ) { // Firefox
    delta = event.detail;
  }
  self._cameraRadius += delta;
  if( self._cameraRadius < self._minCameraRadius ) {
    self._cameraRadius = self._minCameraRadius;
  }
}

THREE.MMOControls.prototype.update = function () {
  var newTime = Date.now();
  var timeDelta = ( newTime - this._lastTime ) / 10;

  //this.updateCenter(timeDelta);
  this._updateCamera();

  this._lastTime = newTime;
}

THREE.MMOControls.prototype._updateCamera = function () {
  this._camera.position.x = this._character.position.x + Math.cos(-this._character.rotation.y - ( Math.PI / 2 ) + this._cameraTheta) * this._cameraRadius;
  this._camera.position.z = this._character.position.z + Math.sin(-this._character.rotation.y - ( Math.PI / 2 ) + this._cameraTheta) * this._cameraRadius;
  this._camera.position.y = this._character.position.y + Math.sin(this._cameraPhi) * this._cameraRadius;
  this._camera.lookAt({
    x: this._character.position.x,
    y: this._character.position.y + 2,
    z: this._character.position.z
  });

  if( this._characterPositionOld.distanceTo(this._character.position) > this._moveCallbackDelta ) {
    this._moveCallback();
    this._characterPositionOld.set(
      this._character.position.x,
      this._character.position.y,
      this._character.position.z
    );
  }
}

/*
THREE.MapControls.prototype = {
  constructor: THREE.MapControls,

  update: function () {
    var newTime = Date.now();
    var timeDelta = ( newTime - this._lastTime ) / 10;

    // + Any other updates.
    this.updateCenter(timeDelta);
    this.updateCamera();

    this._lastTime = newTime;
  },

  updateCenter: function (timeDelta) {
    // It might be really clever to adjust this based on the camera radius ( smaller = slower )

    this._center.x = this._cameraPhi * this._centerAccelerationValue * Math.cos(this._centerAccelerationAngle) * Math.pow(timeDelta,2) + this._centerVelocity.x * timeDelta + this._center.x;
    this._center.z = this._cameraPhi * this._centerAccelerationValue * Math.sin(this._centerAccelerationAngle) * Math.pow(timeDelta,2) + this._centerVelocity.z * timeDelta + this._center.z;
    
    this._centerVelocity.x = this._cameraPhi * this._centerAccelerationValue * Math.cos(this._centerAccelerationAngle) * timeDelta - this._centerVelocity.x * this._friction;
    this._centerVelocity.z = this._cameraPhi * this._centerAccelerationValue * Math.sin(this._centerAccelerationAngle) * timeDelta - this._centerVelocity.z * this._friction;
    if( Math.abs(this._centerVelocity.x) <= this._minVelocity ) {
      this._centerVelocity.x = 0;
    }
    if( Math.abs(this._centerVelocity.z) <= this._minVelocity ) {
      this._centerVelocity.z = 0;
    }
  },

  updateCamera: function () {
    this._cameraTheta += this._cameraThetaDelta;
    this._cameraPhi += this._cameraPhiDelta;
    if( this._cameraPhi > this._maxPhi ) {
      this._cameraPhi = this._maxPhi;
    } else if ( this._cameraPhi < this._minPhi ) {
      this._cameraPhi = this._minPhi;
    }
    this._camera.position.x = this._center.x + Math.cos(this._cameraTheta) * this._cameraRadius;
    this._camera.position.z = this._center.z + Math.sin(this._cameraTheta) * this._cameraRadius;
    this._camera.position.y = this._center.y + Math.sin(this._cameraPhi) * this._cameraRadius;
    this._camera.lookAt(this._center);

    if( Math.sqrt( 
        Math.pow(this._camera.position.x - this._cameraPositionOld.x,2) + 
        Math.pow(this._camera.position.y - this._cameraPositionOld.y,2) + 
        Math.pow(this._camera.position.z - this._cameraPositionOld.z,2)) >= this._moveCallbackDelta ) {
      this._cameraPositionOld = {
        x: this._camera.position.x,
        y: this._camera.position.y,
        z: this._camera.position.z
      };
      this._moveCallback();
    }

    this._cameraPositionOld

  },

  _updateAcceleration: function () {
    var vector = [0,0];
    for( i in this._activeCenterKeys ) {
      if( this._activeCenterKeys[i] ) {
        vector[0] += this._keyCenterMappings[i][0];
        vector[1] += this._keyCenterMappings[i][1];
      }
    }
    if( vector[0] != 0 || vector[1] != 0 ) {
      this._centerAccelerationValue = this._acceleration;
      this._centerAccelerationAngle = this._cameraTheta - Math.PI + this._vectorAngles[vector[0].toString()][vector[1].toString()];
    } else {
      this._centerAccelerationValue = 0;
    }
  },

  _updateTheta: function () {
    var delta = 0;
    for( i in this._activeThetaKeys ) {
      if( this._activeThetaKeys[i] ) {
        delta += this._keyThetaMappings[i];
      }
    }
    this._cameraThetaDelta = delta;
    this._updateAcceleration();
  },

  _updatePhi: function () {
    var delta = 0;
    for( i in this._activePhiKeys ) {
      if( this._activePhiKeys[i] ) {
        delta += this._keyPhiMappings[i];
      }
    }
    this._cameraPhiDelta = delta;
  }

}
*/