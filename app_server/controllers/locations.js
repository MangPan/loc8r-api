var request = require('request');

const apiOptions = {
    server: 'http://localhost:3000'
};

if ((process.env.NODE_ENV === 'production')) {
    apiOptions.server = 'https://loc8r-api-4xp3.onrender.com';
}


const homelist = (req, res) => {
    const path = '/api/locations';
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'GET',
        json: {},
        qs: {
            lng: 127.2637,
            lat: 37.0118,
            maxDistance: 200000
        }
    };
    request(
        requestOptions,
        (err, { statusCode }, body) => {
            let data = [];
            if (statusCode == 200 && body.length) {
                data = body.map((item) => {
                    item.distance = formatDistance(item.distance);
                    return item;
                });
            }
            renderHomepage(req, res, body);
        }
    )
}

const formatDistance = (distance) => {
    let thisDistance = 0;
    let unit = 'm';
    if (distance > 1000) {
        thisDistance = parseFloat(distance / 1000).toFixed(1);
        unit = 'km';
    }
    else {
        thisDistance = Math.floor(distance);
    }
    return thisDistance + unit;
}

const renderHomepage = (req, res, responseBody) => {
    let message = null;
    if (!(responseBody instanceof Array)) {
        message = "API lookup error";
        responseBody = [];
    }
    else {
        if (!responseBody.length) {
            message = "No places found nearby";
        }
    }

    res.render('locations-list', {
        title: 'Loc8r - find a place to work with wifi',
        pageHeader: {
            title: 'Loc8r',
            strapLine: 'Find places to work with wifi near you!'
        },
        sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
        locations: responseBody,
        message
    });
}





// const locationInfo = (req, res) => {
//     res.render('location-info',
//         {
//             title: 'Starcups',
//             pageHeader: {
//                 title: 'Loc8r - by 2025810083 강민준',
//             },
//             sidebar: {
//                 context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
//                 callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
//             },
//             location: {
//                 name: 'Starcups',
//                 address: '125 High Street, Reading, RG6 1PS',
//                 rating: 3,
//                 facilities: ['Hot drinks', 'Food', 'Premium wifi'],
//                 coords: { lat: 37.01041591509776, lng: 127.26206854938405 },
//                 openingTimes: [
//                     {
//                         days: 'Monday - Friday',
//                         opening: '7:00am',
//                         closing: '7:00pm',
//                         closed: false
//                     },
//                     {
//                         days: 'Saturday',
//                         opening: '8:00am',
//                         closing: '5:00pm',
//                         closed: false
//                     },
//                     {
//                         days: 'Sunday',
//                         closed: true
//                     }
//                 ],
//                 reviews: [
//                     {
//                         author: 'Simon Holmes',
//                         rating: 5,
//                         timestamp: '16 July 2013',
//                         reviewText: 'What a great place. I can\'t say enough good things about it.'
//                     },
//                     {
//                         author: 'Charlie Chaplin',
//                         rating: 3,
//                         timestamp: '16 June 2013',
//                         reviewText: 'It was okay. Coffee wasn\'t great, but the wifi was fast.'
//                     }
//                 ]
//             }
//         }
//     );
// };


const getLocationInfo = (req, res, callback) => {
    const path = `/api/locations/${req.params.locationid}`;
    console.log("my log : " + req.params.locationid);
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'GET',
        json: {}
    };

    request(
        requestOptions,
        (err, {statusCode}, body) => {
            let data = body;
            if (statusCode == 200) {
                data.coords = {
                    lng: body.coords[0],
                    lat: body.coords[1]
                };
                // renderDetailPage(req, res, data);
                console.log(data);
                callback(req, res, data);
            }
            else{
                showError(req, res, statusCode);
            }

        }
    );
};

const locationInfo = (req, res) => {
    getLocationInfo(req, res, 
        (req, res, responseData) => renderDetailPage(req, res, responseData))
}


const showError = (req, res, status) => {
    let title = '';
    let content = '';
    if(status == 404) {
        title = '404, page not found. by 2025810083 강민준';
        content = 'Oh dear. Looks like you can\'t find this page. Sorry.';
    }
    else{
        title = `${status}, something's gone wrong`;
        content = 'Something, somewhere, has gone just a little bit wrong.';
    }
    res.status(status);
    res.render('generic-text', {
        title,
        content
    });
};


const renderDetailPage = function (req, res, location) {
    res.render('location-info', {
        title: location.name,
        pageHeader: {
            title: location.name
        },
        sidebar: {
            context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
            callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
        },
        location
    });
};



// const renderReviewForm = (req, res) => {
//     res.render('location-review-form', {
//         title: "Review Starcups on Loc8r",
//         pageHeader : {title : 'Review Starcups'}
//     });
// };

const renderReviewForm = function (req, res, {name}) {
        res.render('location-review-form', {
            title: `Review ${name} on Loc8r`,
            pageHeader : {title : `Review ${name}`},
            error: req.query.err
    });
}





const doAddReview = (req, res) => {
    const locationid = req.params.locationid;
    const path = `/api/locations/${locationid}/reviews`;

    const postdata = {
        author : req.body.name,
        rating : parseInt(req.body.rating, 10),
        reviewText : req.body.review
    };
    
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method : 'POST',
        json : postdata
    };

    if(!postdata.author || !postdata.rating || !postdata.reviewText){
        res.redirect(`/location/${locationid}/review/new?err=val`);
    }
    else{
        request(
            requestOptions,
            (err, {statusCode}, {name}) => {
                if(statusCode == 201) {
                    res.redirect(`/location/${locationid}`);
                }
                else if(statusCode == 400 && name && name == 'ValidationError'){
                    res.redirect(`/location/${locationid}/review/new?err=val`);
                }
                else {
                    showError(req, res, statusCode);
                }
            }
        );
    }
};

const addReview = (req, res) => {
    getLocationInfo(req, res, 
        (req,res,responseData) => renderReviewForm(req, res, responseData)
    );
};

module.exports = {
    homelist,
    locationInfo,
    addReview,
    doAddReview
};

