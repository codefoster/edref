// This is the main app.js. We're using the cylon library here. One nice thing
// about the cylon library is that you can talk to various device types such as
// Edison, Beaglebone, RasPi, etc. without using device specific language.

//include node.js packages here if you want (see npmjs.org for packages)
console.log('hi');
require('cylon').robot({
//    connections: { edison: { adaptor: 'intel-iot' } },
//    devices: {
//        //list all of the sensors, lights, etc. that you will use
//        led: { driver: 'led', pin: 13 }
//    },
    
//    // this is where you write the main part of your app
//    work: function (my) {
//        every((0.1).second(), function () {
//            //my.led.toggle();
//        });
//    }
}).start();
