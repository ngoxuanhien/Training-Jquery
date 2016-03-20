window.addEventListener('load', function() {

    var input =  that.fontContent.find('.font-size-input > input[type=range]').get(0);

    input.addEventListener('change', function(e) {
        console.log(input.value);
    });

    var fixInputAndChangeEvents = function() {
        var currentSlider;
        var fireChange = function(e) {
            var changeEvent = document.createEvent('Event');
            changeEvent.initEvent('change', true, true);

            changeEvent.forceChange = true;
            currentSlider.dispatchEvent(changeEvent);
        };

        document.addEventListener('change', function(e) {
            var inputEvent;
            if (!e.forceChange && e.target.getAttribute('type') === 'range') {
                e.stopPropagation();
                inputEvent = document.createEvent('Event');
                inputEvent.initEvent('input', true, true);

                e.target.dispatchEvent(inputEvent);

                currentSlider = e.target;
                document.removeEventListener('mouseup', fireChange);
                document.addEventListener('mouseup', fireChange);
            }

        }, true); // make sure we're in the capture phase
    };

    var isIE = function() {
        var userAgent = navigator.userAgent;
        return userAgent.indexOf('MSIE') !== -1 ||
        userAgent.indexOf('Trident') !== -1;
    };

    if (isIE()) {
        fixInputAndChangeEvents();
    }

});