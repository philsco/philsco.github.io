(function ($) {
    'use strict';

    /** Init settings **/
    (function () {
        // Setup reveal and ajax loading
        window.scrollRevealEnabled = function () {
            var scrollReveal = sessionStorage.getItem('scroll-reveal');
            if (scrollReveal == null) {
                sessionStorage.setItem('scroll-reveal', '1');
            }
            return scrollReveal == null ? true : (scrollReveal == '1');
        };
        window.ajaxLoadingEnabled = function () {
            var ajaxLoading = sessionStorage.getItem('ajax-loading');
            if (ajaxLoading == null) {
                sessionStorage.setItem('ajax-loading', '1');
            }
            return ajaxLoading == null ? true : (ajaxLoading == '1');
        };
    })();

    /** Window load handler **/
    $(window).load(function () {
        // Hide preloader
        $('#preloader').velocity({ opacity: 0 }, { visibility: "hidden", duration: 500 });

        // Fix menu rendering
        if (scrollRevealEnabled()) {
            $('.menuitem:last').one('afterReveal', function () {
                $('#nav').addClass('ui-menu-color06');
            });
        } else {
            $('#nav').addClass('ui-menu-color06');
        }

        // Header Animations
        if (scrollRevealEnabled()) {
            scrollReveal(scrollRevealItems.header);
        }

        // Footer Animations
        if (scrollRevealEnabled()) {
            scrollReveal(scrollRevealItems.footer);
        }

        /** Back to top **/
        (function () {
            var backTopVisible = false;
            var backTopEvent = false;
            var $backTop = $('#back-top');
            $backTop.on('click', function () {
                $backTop.velocity({ bottom: "-=20px", opacity: 0 }, { visibility: "hidden" });
                $("body").velocity("scroll", { duration: 1000,
                    begin: function() { backTopEvent = true },
                    complete: function() { backTopEvent = false; backTopVisible = false }
                });
                return false;
            });

            var scrollTrigger = 100, // px
                backToTop = function () {
                    var scrollTop = window.pageYOffset;
                    if (scrollTop > scrollTrigger && !backTopVisible) {
                        backTopVisible = true;
                        $backTop.velocity({ bottom: '+=20px', opacity: 1 }, { visibility: 'visible', duration: 600 });
                    } else if (scrollTop <= scrollTrigger && backTopVisible && !backTopEvent) {
                        backTopVisible = false;
                        $backTop.velocity({ bottom: "-=20px", opacity: 0 }, { visibility: "hidden", duration: 600 });
                    }
                };
            backToTop();
            $(window).on('scroll', backToTop);
        })();
    });

    /** Document ready handler **/
    $(document).ready(function () {
        // Load scripts for each section (portfolio, counter ...)
        sectionsScripts();

        /** Ajax page load settings **/
        (function () {

            if (ajaxLoadingEnabled()) {
                $(document).pjax('a', '.content-wrap', {fragment: '.content-wrap'});

                $(document).on('pjax:click', function (event) {
                    if (!ajaxLoadingEnabled()) {
                        event.preventDefault();
                        window.location.reload();
                    }
                });

                $(document).on('pjax:end', function () {
                    document.activeElement && document.activeElement.blur();
                    sectionsScripts();
                });

                $(document).on('pjax:beforeReplace', function () {
                    $('.content-wrap')
                        .velocity({ opacity: 0 }, { duration: 0 })
                        .velocity({ opacity: 1 }, { duration: 300, easing: [ 0, 1, 1, 0 ] });
                });

                $(document).on('pjax:success', function () {
                    // Scroll for mobile nav
                    if (document.documentElement.clientWidth < 768) {
                        $('#nav').velocity('scroll', {duration: 0});
                    }
                });
            }

        })();
    });

    /** Set of sections scripts **/
    function sectionsScripts() {

        /** Script for Progress Bars **/
        (function () {
            if ($('[data-progressbar]').length) {
                $('[data-progressbar]').each(function(key, bar) {
                    var data = progressbarConfig($(bar).data());
                    switch (data.progressbar) {
                        case 'line':
                            bar = new ProgressBar.Line(bar, data);
                            break;
                        case 'circle':
                            bar = new ProgressBar.Circle(bar, data);
                            break;
                        case 'semicircle':
                            bar = new ProgressBar.SemiCircle(bar, data);
                            break;
                    }

                    if (scrollRevealEnabled()) {
                        $('[data-section="progress"]').one('afterReveal', function () {
                            bar.animate(data.value);
                        });
                    } else {
                        bar.animate(data.value);
                    }
                });
            }
        })();

        /** Bar Skills Progress **/
        (function () {
            if ($('[data-section="bar-skills"]').length) {

                var animateSkillsElements = function () {
                    var delay = 50;
                    $('[data-section="bar-skills"] .progress-bar').each(function () {
                        var valuenow = $(this).attr('aria-valuenow');
                        $(this).velocity({ width: valuenow + "%" }, { duration: 400, easing: "swing", delay: delay });
                        delay += 150;
                    });
                };

                if (scrollRevealEnabled()) {
                    $('[data-section="bar-skills"]').one('afterReveal', function () {
                        animateSkillsElements();
                    });
                } else {
                    animateSkillsElements();
                }
            }
        })();

        /** Script for Portfolio section **/
        (function () {
            if ($('[data-section="portfolio"], [data-section="blog"]').length) {

                // Magnific Popup
                $('.gallery-item').magnificPopup({
                    type: 'image',
                    gallery: {
                        enabled: true
                    }
                });

                $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
                    disableOn: 700,
                    type: 'iframe',
                    mainClass: 'mfp-fade',
                    removalDelay: 160,
                    preloader: false,

                    fixedContentPos: false
                });

                // Isotope Portfolio
                var grid = $('.grid').isotope({
                    itemSelector: '.grid-item',
                    percentPosition: true,
                    transitionDuration: '0.6s',
                    hiddenStyle: {
                        opacity: 0
                    },
                    visibleStyle: {
                        opacity: 1
                    },
                    masonry: {
                        // use outer width of grid-sizer for columnWidth
                        columnWidth: '.grid-sizer'
                    }
                });

                grid.imagesLoaded(function () {
                    grid.isotope();
                });

                grid.isotope({filter: '*'});

                // filter items on button click
                $('#isotope-filters').on('click', 'a', function () {
                    var filterValue = $(this).attr('data-filter');
                    grid.isotope({filter: filterValue});
                });

                // filter items on tag click
                $('.post-tag').on('click', 'a', function () {
                    var filterValue = $(this).attr('data-filter');
                    grid.isotope({filter: filterValue});
                    $('#isotope-filters a[data-filter="' + filterValue + '"]').focus();
                });
            }
        })();

        /**Quick Ping form **/
        (function () {
            $('#qping-btn').on('click', function () {
                var qEmail = $("#qping").val();
                var payload = JSON.stringify({"email": qEmail});
                $.ajax({
                    type: 'POST',
                    url: "https://nk6kd6bvjg.execute-api.us-east-1.amazonaws.com/prod/contact",
                    data: payload
                })
                .done(function (response) {
                    // Make sure that the formMessages div has the 'success' class.
                    $("#qping-messages").removeClass('alert alert-danger');
                    $("#qping-messages").addClass('alert alert-success');

                    // Set the message text.
                    $("#qping-messages").text("Email address successfully sent.");

                    // Clear the form.
                    $('#qping').val('');
                })
                .fail(function (data) {
                    // Make sure that the formMessages div has the 'error' class.
                    $("#qping-messages").removeClass('alert alert-success');
                    $("#qping-messages").addClass('alert alert-danger');

                    // Set the message text.
                    if (data.responseText !== '') {
                        $("#qping-messages").text("Contact info successfully submited.");
                    } else {
                        $("#qping-messages").text('Oops! An error occured and your message could not be sent.');
                    }
                })
            })
        })();


        /** Contact Form **/
        (function () {
            if ($('[data-section="feedback"]').length) {
                // Get the form.
                var form = $('#ajax-contact');

                // Get the messages div.
                var formMessages = $('#form-messages');

                // Set up an event listener for the contact form.
                $(form).submit(function (e) {
                    // Stop the browser from submitting the form.
                    e.preventDefault();

                    // Serialize the form data.
//                    var formData = $(form).serializeArray();

                    var formData = {};
                    formData["email"] = $('#email').val();
                    formData["name"] = $('#name').val();
                    formData["message"] = $('#message').val();

                    // Submit the form using AJAX.
                    $.ajax({
                        type: 'POST',
                        url: $(form).attr('action'),
                        data: JSON.stringify(formData)
                    })
                        .done(function (response) {
                            // Make sure that the formMessages div has the 'success' class.
                            $(formMessages).removeClass('alert alert-danger');
                            $(formMessages).addClass('alert alert-success');

                            // Set the message text.
                            $(formMessages).text(response);

                            // Clear the form.
                            $('#name').val('');
                            $('#email').val('');
                            $('#message').val('');
                        })
                        .fail(function (data) {
                            // Make sure that the formMessages div has the 'error' class.
                            $(formMessages).removeClass('alert alert-success');
                            $(formMessages).addClass('alert alert-danger');

                            // Set the message text.
                            if (data.responseText !== '') {
                                $(formMessages).text("Contact info successfully submited.");
                            } else {
                                $(formMessages).text('Oops! An error occured and your message could not be sent.');
                            }
                        });
                });
            }
        })();



        // Sections Animation
        if (scrollRevealEnabled()) {
            scrollReveal(scrollRevealItems.content);
        }
    }

    /** Load js script to head **/
    function loadScript(src, id) {
        if (document.getElementById(id)) {
            return;
        }
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.id = id;
        document.getElementsByTagName("head")[0].appendChild(script);
        script.src = src;
    }

    /** Animation handler **/
    function scrollReveal(items) {

        window.sr = window.sr || ScrollReveal();

        $.each(items, function(itemKey, reveal) {
            $(reveal.selector).each(function(index, elem) {
                var data = elem.dataset;

                var revealData = {
                    duration: (typeof data.animationDuration != "undefined") ? parseInt(data.animationDuration)
                        : (reveal.data.duration || 1000),
                    origin: (typeof data.animationOrigin != "undefined") ? data.animationOrigin
                        : (reveal.data.origin || 'bottom'),
                    distance: (typeof data.animationDistance != "undefined") ? data.animationDistance
                        : (reveal.data.distance || '0px'),
                    delay: (typeof data.animationDelay != "undefined") ? parseInt(data.animationDelay)
                        : (reveal.data.delay || 0),
                    scale: (typeof data.animationScale != "undefined") ? parseFloat(data.animationScale)
                        : (reveal.data.scale || 1),
                    rotate: (typeof data.animationRotate != "undefined") ? data.animationRotate
                        : (reveal.data.rotate || { x: 0, y: 0, z: 0 }),
                    easing: (typeof data.animationEasing != "undefined") ? data.animationEasing
                        : (reveal.data.easing || 'cubic-bezier(1.000, 1.000, 1.000, 1.000)'),
                    mobile: false,
                    afterReveal: function(elem) { $(elem).trigger('afterReveal') }
                };

                window.sr.reveal(elem, revealData);

                if (window.sr.tools.isMobile()) {
                    $(elem).trigger('afterReveal');
                }
            });
        });
    }

    /** Config for progress bar **/
    function progressbarConfig(data) {
        return {
            value: (typeof data.progressbarValue != "undefined") ? parseFloat(data.progressbarValue) : 1,
            progressbar: (typeof data.progressbar != "undefined") ? data.progressbar : 'circle',
            color: (typeof data.progressbarColor != "undefined") ? data.progressbarColor : '#fff',
            strokeWidth: (typeof data.progressbarStrokewidth != "undefined") ? parseInt(data.progressbarStrokewidth) : 4,
            trailWidth: (typeof data.progressbarTrailwidth != "undefined") ? parseFloat(data.progressbarTrailwidth) : 1,
            trailColor: (typeof data.progressbarTrailcolor != "undefined") ? data.progressbarTrailcolor : '#f4f4f4',
            easing: (typeof data.progressbarEasing != "undefined") ? data.progressbarEasing : 'easeInOut',
            duration: (typeof data.progressbarDuration != "undefined") ? parseInt(data.progressbarDuration) : 1400,
            text: {
                autoStyleContainer: false
            },
            from: (typeof data.progressbarFrom != "undefined") ? data.progressbarFrom : { color: '#aaa', width: 1 },
            to: (typeof data.progressbarTo != "undefined") ? data.progressbarTo : { color: '#333', width: 4 },
            // Set default step function for all animate calls
            step: function(state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);

                var value = Math.round(circle.value() * 100);
                if (value === 0) {
                    circle.setText('');
                } else {
                    circle.setText(value + '%');
                }
            }
        };
    }

})(jQuery);












