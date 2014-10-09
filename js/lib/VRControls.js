THREE.VRControls = function ( object ) {

	var self = this;

	//HMD sensor stuff
	var sensorDevice;
	var vrState;

	//device orientation stuff
	var deviceControls;

	function gotVRDevices( devices ) {
		var vrInput;
		var error;
		for ( var i = 0; i < devices.length; ++i ) {
			if ( devices[i] instanceof PositionSensorVRDevice ) {
				sensorDevice = devices[i];
				console.log('Using Sensor Device:', sensorDevice.deviceName);

				if ( sensorDevice.zeroSensor ) {
					self.zeroSensor = sensorDevice.zeroSensor.bind(sensorDevice);
				} else if ( sensorDevice.resetSensor ) {
					self.zeroSensor = sensorDevice.resetSensor.bind(sensorDevice);
				}
				self.zeroSensor();
				break; // We keep the first we encounter
			}
		}
	}

	function deviceOrientationChange( event ) {
		window.removeEventListener( "deviceorientation", deviceOrientationChange, false );
		deviceControls = new THREE.DeviceOrientationControls( object );
		deviceControls.connect();
		if (!this.freeze) {
			deviceControls.update();
		}
	}

	this.update = function() {
		// Applies head rotation from sensor data.
		if (this.freeze) {
			return;
		}

		if ( sensorDevice ) {
			vrState = sensorDevice.getState();
			if ( vrState ) {
				object.quaternion.copy( vrState.orientation );
				object.position.copy( vrState.position );
				object.updateMatrixWorld();
			}
		} else if (deviceControls) {
			deviceControls.update();
			object.rotateY(-zeroAngle);
			object.updateMatrixWorld();
		}
	};

	//only useful when frozen
	this.reset = function () {
		if ( object ) {
			object.quaternion.set( 0, 0, 0, 1 );
			object.position.set( 0, 0, 0 );
		}
	};

	//zeros only rotation on Y axis
	//todo: find out if it zeros out position. need a DK2 to test
	this.zeroSensor = function () {
		zeroAngle = object.rotation.y;
	};

	this.freeze = false;

	//todo: connect/disconnect methods
	//todo: method to query orientation/position without changing object
	//todo: work without an object
	//todo: method to query which tech we're using

	if ( navigator.getVRDevices ) {
		navigator.getVRDevices().then( gotVRDevices );
	} else if ( navigator.mozGetVRDevices ) {
		navigator.mozGetVRDevices( gotVRDevices );
	} else if ( "DeviceOrientationEvent" in window && THREE.DeviceOrientationControls) {
		//device orientation
		window.addEventListener( "deviceorientation", deviceOrientationChange, false );
	}
};