if (!window.jQuery)document.write('<script src="//cdn.jsdelivr.net/jquery/2.1.3/jquery.min.js"><\/script>');


// Create IE + others compatible event handler
var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

//respond to events
eventer(messageEvent, function (event) {
    if (typeof (event.data) !== 'undefined') {
        var data = event.data;
        if (typeof(event.data) === 'string') {
            data = JSON.parse(event.data);
        }
        if (typeof data.action !== 'undefined' && data.action == 'personalizationComplete') {
            personalizationComplete(data);
        }
    } else return;
}, false);
/*
 *funciton callback when the personlizations card is complete
 * @param data is array
 */
function personalizationComplete(data) {
    closeLightBox();
    saveGCIAndContinue(data);
}

function saveGCIAndContinue(responseData) {

    var resData = '{"responseData":' + JSON.stringify(responseData) + '}';
    if (document.getElementById('catEntryId_6') != null && document.getElementById('GCIResponse') != null) {
        document.getElementById('GCIResponse').value = resData;
        var jsonStr = resData;
        var respObj = JSON.parse(jsonStr);
        var sku = respObj.responseData.sku;
        var brandId = document.getElementById('brandid') != null ? document.getElementById('brandid').value : "";
        var catEntryId;
        $.ajax({
            type: 'POST',
            async: false,
            url: "/FDResolveCatalogEntryForSkuCmd",
            data: {
                "sku": sku,
                "brandId": brandId,
            },
            success: function (data) {
                if (data != null) {
                    var obj = jQuery.parseJSON(data);
                    if (obj.catEntryId != null && obj.catEntryId != '') {
                        document.getElementById('catEntryId_6').value = obj.catEntryId;
                        populateGCIFieldsPDPPage(respObj);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                // do nothing
            }
        });
    } else if (document.getElementById('GCIResponse') != null) {
        document.getElementById('GCIResponse').value = resData;
        var jsonStr = resData;
        var orderItemId = document.getElementById('orderItemId').value;
        var brandId = document.getElementById('prodbrandId').value;
        var gciItemType = document.getElementById('gciItemType') != null ? document.getElementById('gciItemType').value : "";
        var respObj = JSON.parse(jsonStr);
        var sku = respObj.responseData.sku;

        $.ajax({
            type: "POST",
            url: "/GciResponseHandler",
            async: false,
            timeout: 5000,
            dataType: "json",
            data: {
                "orderItemId": orderItemId,
                "brandId": brandId,
                "gciItemType": gciItemType,
                "pData": jsonStr,
                "sku": sku,

            },
            success: function (data) {
                if (data.success == false) {
                    populateError();
                }
                else {
                    if (document.getElementById("giftMessages.gcimplemetation") != null && document.getElementById("giftMessages.gcimplemetation").checked) {
                        populateGCIFields(respObj, data.offerPrice);
                    } else {
                        "" != gciItemType && window.location.reload();
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                populateError();
            }
        });


    }
}

function populateError() {
    document.getElementById("gciError").style.display = "block";
    //To Do : get this error message from properties file...
    document.getElementById("gciErrorMsg").innerHTML = "Error occured while personalizing your item.";
}

function populateGCIFields(respObj, offerPrice) {
    var imgDiv = document.getElementById('u146');
    var imgElem = document.getElementById("u146_img");
    if (null != imgDiv && null != imgElem) {
        imgDiv.style.display = "block";
        imgElem.src = respObj.responseData.thumbnail;
    }
    var txtElem = document.getElementById('u148');
    if (null != txtElem && null != document.getElementById("perMsg")) {
        txtElem.style.display = "block";
        document.getElementById("perMsg").innerHTML = respObj.responseData.text;
        document.getElementById("GCIItemPrice").innerHTML = offerPrice;
    }
}
function populateGCIFieldsPDPPage(respObj) {
    if ($("div#personalizedItem").length <= 0) {
        return;
    }
    document.getElementById("personalizedItem").style.display = "block";
    var imgElem = document.getElementById("u351_img");
    if (null != imgElem) {
        imgElem.src = respObj.responseData.thumbnail;
    }
    if (null != document.getElementById("pdpPerMsg")) {
        document.getElementById("pdpPerMsg").innerHTML = respObj.responseData.text;
    }
}

function deleteGCIItem(gciItemType, gciParentItemId) {
    var result = confirm('Do you really want to Remove?');
    if (result == true) {
        $.ajax({
            type: 'POST',
            url: '/GciResponseHandler',
            async: false,
            timeout: 5000,
            dataType: "json",
            data: {
                "orderItemId": gciParentItemId,
                "gciItemType": gciItemType,
            },
            success: function (data) {
                if (document.getElementById("giftMessages.gcimplemetation") != null && document.getElementById("giftMessages.gcimplemetation").checked) {
                    window.location.href = window.location.origin + window.location.pathname + '?storeId=' + urlParameter('storeId') + '&catalogId=' + urlParameter('catalogId') + '&langId=' + urlParameter('langId');
                } else {
                    "" != gciItemType && window.location.reload();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
            }
        });
    }

}

function getKeyURL(checkoj, isEdit, isViewOnly, isProductPer, skuCatentryId) {
    if (!isViewOnly && document.getElementById('u344_input') != null && !isEdit) {
        if (document.getElementById('u344_input').checked) {
            $('#catentryId').val(skuCatentryId);
            if ($('#GCIResponse').val() != '') {
                document.getElementById("personalizedItem").style.display = "block";
                return;
            }
        } else {
            $('div#personalizedItem').hide();
            return;
        }
    }
    if (!isProductPer) {
        if ($("#u146_img").attr('src') != "" && !isEdit) {
            return;
        }
    }

    if (!isEdit && !isProductPer) {
        var preOj = getPreName(checkoj);
        var noCard = document.getElementById(preOj + ".noCard");
        var complementCard = document.getElementById(preOj + ".complementCard");
        var complementCardDiv = document.getElementById(preOj + ".ComplimentaryCardMessage");
        if (document.getElementById("noMsgSelect") != null)
            document.getElementById("noMsgSelect").style.display = "none";
        if (document.getElementById("UseGiftMsgForAll") != null && document.getElementById("UseGiftMsgForAll") != undefined)
            document.getElementById("UseGiftMsgForAll").style.display = 'none';

        noCard.checked = false;
        complementCard.checked = false;
        if (complementCardDiv != null && complementCardDiv != undefined) complementCardDiv.style.display = 'none';
    }
    var url = document.getElementById('AjaxGCIGetKey').value;
    var categoryId = document.getElementById("categoryId") != null ? document.getElementById("categoryId").value : '';
    url = url + "&catentryId=" + skuCatentryId + "&categoryId=" + categoryId;

    if (isViewOnly) {
        url = url + "&isViewOnly=true";
    }
    if (isProductPer) {
        url = url + "&isProductPer=true";
    }

    $.ajax({
        type: 'POST',
        url: url,
        processData: false,
        contentType: "application/json",
        success: function (data) {
            if (data != null) {
                var obj = jQuery.parseJSON(data);
                var gciurl = obj.GCIEndPointURL;
                var GCIModalURL = document.getElementById('GCIModalURL').value;
                gciurl = gciurl.replace(/&amp;/g, '&');
                GCIModalURL = GCIModalURL + '&GCIURL=' + gciurl;
                $('#GCIPerEditURL').val(gciurl);
                openLightBox("", 1000, 637, GCIModalURL);
                document.getElementById("TB_closeWindowButton").innerHTML = "";
                if (!isViewOnly && !isEdit) {
                    if (document.getElementById("giftMessages.ComplimentaryCardMessage") != null) {
                        $("#TB_closeWindowButton").attr("onclick", "javascript:hideGCIiframe()");
                    } else if (document.getElementById("u344_input") != null) {
                        $("#TB_closeWindowButton").attr("onclick", "javascript:closeGCILightBox()");
                    }
                }
                // Defect DE10783
                document.getElementById("TB_window").style.height = "625px";
                document.getElementById("TB_ajaxContent").style.height = "570px";
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            var onFailureGCIRedirectURL = document.getElementById("onFailureGCIRedirectURL") != null ? document.getElementById("onFailureGCIRedirectURL").value : '';
            if (onFailureGCIRedirectURL != null && onFailureGCIRedirectURL != '') {
                window.location.href = onFailureGCIRedirectURL;
            }
            document.getElementById("gciErrorMsg").innerHTML = "Operation failed for GCI Approval.";
            //do nothing
        }
    });
}

function hideGCIiframe() {
    if (document.getElementById("GCIIFrame") != null && document.getElementById("GCICloseIframe") != null) {
        null != document.getElementById("GCICloseIframe") && (document.getElementById("GCICloseIframe").style.display = "none");
        null != document.getElementById("TB_cancelWindowButton") && (document.getElementById("TB_cancelWindowButton").style.display = "none");
        null != document.getElementById("TB_overlay") && (document.getElementById("TB_overlay").style.display = "none");
        null != document.getElementById("TB_window") && (document.getElementById("TB_window").style.display = "none", document.getElementById("TB_window").innerHTML = "");
        null != document.getElementById("GCIIFrame") && (document.getElementById("GCIIFrame").style.display = "none", document.getElementById("GCIIFrame").innerHTML = "");
        null != document.getElementById("giftMessages.ComplimentaryCardMessage") && (document.getElementById("giftMessages.ComplimentaryCardMessage").style.display = "block");
        null != document.getElementById("giftMessages.complementCard") && (document.getElementById("giftMessages.complementCard").checked = !0);
    }
    $("div#MessageOptionsGCI > div").css("display", "none")
}
function closeGCILightBox() {
    $('#u344_input').prop('checked', false);
}
$("#u374").click(closeGCILightBox);
function editGCIPer(isProductPer) {
    var jsonStr = document.getElementById('GCIResponse').value;
    var respObj = JSON.parse(jsonStr);
    var sku = respObj.responseData.sku;
    var editGCIPerURL = $('#AjaxGCIGetKey').val() + '&skuId=' + respObj.responseData.sku + '&keyId=' + respObj.responseData.key_id;
    var catentryId = $('#catentryId').val();
    $('#AjaxGCIGetKey').val(editGCIPerURL);
    getKeyURL(this, true, false, isProductPer, catentryId);
}
