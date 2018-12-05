var _chapReadyCount = 0;
const PCT_FIC_INFOS = 10;
const PCT_CHAPTERS = 60;
const PCT_EPUB = 10;
const PCT_MOBI = 10;

$(document).ready(function ()
{
    showEmail($("#send-email").prop("checked"));
    var socket = io();

    $("#input-form").submit(function (e)
    {
        e.preventDefault();
        reset();
        if ($("#input-text").val().length <= 0)
            return;

        updateStatusText("Looking up fanfiction...");

        socket.emit("convert-start",
            {
                url: $("#input-text").val(),
                forceUpdate: $("#force-update").prop("checked"),
                fileType: $("#file-type").val(),
                sendEmail: $("#send-email").prop("checked"),
                email: $("#email-address").val()
            });

        $.ajax
        ({
            url: "/setCookie",
            method: "POST",
            data: {
                autoDL: $("#auto-dl").prop("checked"),
                fileType: $("#file-type").val(),
                sendEmail: $("#send-email").prop("checked"),
                email: $("#email-address").val()
            },
            dataType: "json"
        });
        enableInputs(false);
    });

    $("#send-email").change(function ()
    {
        showEmail(this.checked);
    });

    $(".navbar .navbar-burger").click(function()
    {
        let target = $(this).data("target");
        $("#"+ target).toggleClass("is-active");
        $(this).toggleClass("is-active");
    });

    $("#fic-opt-button").click(function()
    {
        var arrow = $(".opt-arrow");
        var ficOpt = $("#fic-opt");

        if (arrow.hasClass("arrow-open"))
            ficOpt.slideUp();
        else
            ficOpt.slideDown();

        arrow.toggleClass("arrow-open");

        
    });
    //************************************************************ Sockets *******************************************************************
    socket.on("critical", function(msg)
    {
        addOutput(msg, "critical");
        $("#critical-icon").show();

        enableInputs(true);
    });
    socket.on("warning", function(msg)
    {
        addOutput(msg, "warning");
        $("#warning-icon").show();
    });

    socket.on("status", updateStatusText);

    socket.on("chapReady", function(chapCount)
    {
        _chapReadyCount++;
        addPercent(parseFloat(PCT_CHAPTERS / chapCount));
        updateStatusText("Chapter ready: "+ _chapReadyCount +"/"+ chapCount);
    });

    socket.on("fileReady", function(data)
    {
        setPercent(100);
        enableInputs(true);
        updateStatusText("<a id=\"download-link\" href=\"/download/"+ data.source +"/"+ data.id +"/"+ data.fileType +"\">Download ready.</a>");
        if ($("#auto-dl").prop("checked"))
            $("#download-link")[0].click();
    });

    socket.on("emailStart", function()
    {
        updateEmailSent("Sending email...", "warning");
    });

    socket.on("emailSent", function(err)
    {
        if (err)
            return updateEmailSent("<span class=\"glyphicon glyphicon-ban-circle\" aria-hidden=\"true\"></span> "+ err, "critical");

        updateEmailSent("<span class=\"glyphicon glyphicon-ok-circle\" aria-hidden=\"true\"></span> Email sent!", "good");
    });

    socket.on("ficInfosReady", function()
    {
        addPercent(PCT_FIC_INFOS);
        updateStatusText("Fanfiction data found...")
    });

    socket.on("epubStart", function()
    {
        addPercent(PCT_EPUB);
    });

    socket.on("mobiStart", function()
    {
        addPercent(PCT_MOBI);
    });

});

function showEmail(bool)
{
    if (bool)
    {
        $("#email-address").show();
        $("#email-sent").show();
    }
    else
    {
        $("#email-address").hide();
        $("#email-sent").hide();
    }

}


function updateStatusText(msg)
{
    $("#status-text").html(msg);
}

function reset()
{
    _chapReadyCount = 0;
    updateStatusText("Ready.");
    enableInputs(true);
    updateEmailSent("");
    $(".output-text").html("");
    setPercent(0);
    $("#critical-icon").hide();
    $("#warning-icon").hide();
}

function enableInputs(bool)
{
    if (bool === true)
    {
        $("#fic-submit").removeAttr("disabled");
        $("#input-text").removeAttr("readonly");
        $("#file-type").removeAttr("disabled");
        $("#force-update").removeAttr("disabled");
        $("#auto-dl").removeAttr("disabled");
        $("#send-email").removeAttr("disabled");
        $("#email-address").removeAttr("readonly");
    }
    else
    {
        $("#fic-submit").attr("disabled", "disabled");
        $("#input-text").attr("readonly", "readonly");
        $("#file-type").attr("disabled", "disabled");
        $("#force-update").attr("disabled", "disabled");
        $("#auto-dl").attr("disabled", "disabled");
        $("#send-email").attr("disabled", "disabled");
        $("#email-address").attr("readonly", "readonly");
    }
}

function updateEmailSent(msg, colorClass)
{
    if (colorClass === undefined)
        colorClass = "";

    $("#email-sent").html("<span class=\""+ colorClass +"\">"+ msg +"</span>");
}

function addOutput(msg, colorClass)
{
    if (colorClass === undefined)
        colorClass = "";

    $(".output-text").html($(".output-text").html() +"<div class=\""+ colorClass +"\">"+ msg +"</div>");
}

function addPercent(pct)
{
    pct = parseFloat(pct);
    var current = parseFloat($(".progress").attr("value"));
    var after = pct + current;

    if (after > 100)
        after = 100;
    
    toggleProgress(true);
    setPercent(after);
}

function setPercent(pct)
{
    toggleProgress(true);
    if (pct > 100)
        pct = 100;

    if (pct < 0)
        pct = 0;

    var pb = $(".progress");
    pb.attr("value", pct);
    //pb.css("width", pct + "%");
}

function toggleProgress(toggled)
{
    var pb = $(".progress");
    pb.css("visibility", toggled ? "visible" : "hidden");
}
