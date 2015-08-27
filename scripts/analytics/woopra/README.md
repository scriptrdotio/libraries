Woopra's platform is designed to be customizable and will adapt to your business needs.

The Woopra JavaScript tracking code is designed for easy customization. It can be tailored to identify your website visitors and track any customer action on your site.

In order to activate tracking by Woopra’s servers using scriptr you just need to include this library , create an instance by passing your domain as parameter and using the function track.

Example:

var clientModule = require("woopra/client"); var woopra = new clientModule.WoopraClient("test.scriptr.io");

var params={"eventName":"scriptcall","cookieHash":"","userID":request.user.id,"optionalParamsObj":{"cv_name":"John+Smith","cv_email":"john@mail.com","ce_item":"Coffee+Machine","ce_category":"Electric+Appliances","ce_sku":"K5236532"}};

console.log(JSON.stringify(woopra.track(params)));
