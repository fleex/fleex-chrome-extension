var dbg = function(s) {
    if(typeof console !== 'undefined'){
        console.log("Readability: " + s);
    }
};

/*
 * Readability. An Arc90 Lab Experiment. 
 * Website: http://lab.arc90.com/experiments/readability
 * Source:  http://code.google.com/p/arc90labs-readability
 *
 * Copyright (c) 2009 Arc90 Inc
 * Readability is licensed under the Apache License, Version 2.0.
 *
 * Simplified version by G. Dupuy @fleextv
**/
var readability = {
    version:     '0.5.1',
    frameHack:   false, /**
                         * The frame hack is to workaround a firefox bug where if you
                                             * pull content out of a frame and stick it into the parent element, the scrollbar won't appear.
                                             * So we fake a scrollbar in the wrapping div.
                                            **/
    flags: 0x1 | 0x2,   /* Start with both flags set. */
    
    /* constants */
    FLAG_STRIP_UNLIKELYS: 0x1,
    FLAG_WEIGHT_CLASSES:  0x2,
    
    /**
     * All of the regular expressions in use within readability.
     * Defined up here so we don't instantiate them repeatedly in loops.
     **/
    regexps: {
        unlikelyCandidatesRe:   /combx|comment|disqus|foot|header|menu|meta|rss|shoutbox|sidebar|sponsor/i,
        okMaybeItsACandidateRe: /and|article|body|column|main/i,
        positiveRe:             /article|body|content|entry|hentry|page|pagination|post|text/i,
        negativeRe:             /combx|comment|contact|foot|footer|footnote|link|media|meta|promo|related|scroll|shoutbox|sponsor|tags|widget/i,
        divToPElementsRe:       /<(a|blockquote|dl|div|img|ol|p|pre|table|ul)/i,
        replaceBrsRe:           /(<br[^>]*>[ \n\r\t]*){2,}/gi,
        replaceFontsRe:         /<(\/?)font[^>]*>/gi,
        trimRe:                 /^\s+|\s+$/g,
        normalizeRe:            /\s{2,}/g,
    },
    
    /**
     * Prepare the HTML document for readability to scrape it.
     * This includes things like stripping javascript, CSS, and handling terrible markup.
     * 
     * @return void
     **/
    prepDocument: function () {
        /**
         * In some cases a body element can't be found (if the HTML is totally hosed for example)
         * so we create a new body node and append it to the document.
         */
        if(document.body === null)
        {
                body = document.createElement("body");
                try {
                        document.body = body;           
                }
                catch(e) {
                        document.documentElement.appendChild(body);
                }
        }

        var frames = document.getElementsByTagName('frame');
        if(frames.length > 0)
        {
            var bestFrame = null;
            var bestFrameSize = 0;
            for(var frameIndex = 0; frameIndex < frames.length; frameIndex++)
            {
                var frameSize = frames[frameIndex].offsetWidth + frames[frameIndex].offsetHeight;
                var canAccessFrame = false;
                try {
                    frames[frameIndex].contentWindow.document.body;
                    canAccessFrame = true;
                } catch(e) {}
                
                if(canAccessFrame && frameSize > bestFrameSize)
                {
                    bestFrame = frames[frameIndex];
                    bestFrameSize = frameSize;
                }
            }

            if(bestFrame)
            {
                var newBody = document.createElement('body');
                newBody.innerHTML = bestFrame.contentWindow.document.body.innerHTML;
                newBody.style.overflow = 'scroll';
                document.body = newBody;
                
                var frameset = document.getElementsByTagName('frameset')[0];
                if(frameset){
                    frameset.parentNode.removeChild(frameset);  
                    readability.frameHack = true;
                }
            }
        }

        /* If we're using a typekit style, inject the JS for it. */
        if (readStyle == "style-classy") {
            var typeKitScript  = document.createElement('script');
            typeKitScript.type = "text/javascript";
            typeKitScript.src  = "http://use.typekit.com/sxt6vzy.js";

            document.body.appendChild(typeKitScript);

            /**
             * Done as a script elem so that it's ensured it will activate
             * after typekit is loaded from the previous script src.
            **/
            var typeKitLoader  = document.createElement('script');
            typeKitLoader.type = "text/javascript";

            var typeKitLoaderContent = document.createTextNode('try{Typekit.load();}catch(e){}');
            typeKitLoader.appendChild(typeKitLoaderContent);
            document.body.appendChild(typeKitLoader);
        }

        /* remove all scripts that are not readability */
        var scripts = document.getElementsByTagName('script');
        for(i = scripts.length-1; i >= 0; i--)
        {
            if(typeof(scripts[i].src) == "undefined" || scripts[i].src.indexOf('readability') == -1)
            {
                scripts[i].parentNode.removeChild(scripts[i]);                  
            }
        }

        /* remove all stylesheets */
        for (var k=0;k < document.styleSheets.length; k++) {
            if (document.styleSheets[k].href != null && document.styleSheets[k].href.lastIndexOf("readability") == -1) {
                document.styleSheets[k].disabled = true;
            }
        }

        /* Remove all style tags in head (not doing this on IE) - TODO: Why not? */
        var styleTags = document.getElementsByTagName("style");
        for (var j=0;j < styleTags.length; j++){
            if (navigator.appName != "Microsoft Internet Explorer"){
                styleTags[j].textContent = "";
            }    
        }

        /* Turn all double br's into p's */
        /* Note, this is pretty costly as far as processing goes. Maybe optimize later. */
        document.body.innerHTML = document.body.innerHTML.replace(readability.regexps.replaceBrsRe, '</p><p>').replace(readability.regexps.replaceFontsRe, '<$1span>')
    },
    
    /**
     * Initialize a node with the readability object. Also checks the
     * className/id for special names to add to its score.
     *
     * @param Element
     * @return void
    **/
    initializeNode: function (node) {
        node.readability = {"contentScore": 0};                 

        switch(node.tagName) {
            case 'DIV':
                node.readability.contentScore += 5;
                break;

            case 'PRE':
            case 'TD':
            case 'BLOCKQUOTE':
                node.readability.contentScore += 3;
                break;
                    
            case 'ADDRESS':
            case 'OL':
            case 'UL':
            case 'DL':
            case 'DD':
            case 'DT':
            case 'LI':
            case 'FORM':
                node.readability.contentScore -= 3;
                break;

            case 'H1':
            case 'H2':
            case 'H3':
            case 'H4':
            case 'H5':
            case 'H6':
            case 'TH':
                node.readability.contentScore -= 5;
                break;
        }

        node.readability.contentScore += readability.getClassWeight(node);
    },
    
    /***
     * grabArticle - Using a variety of metrics (content score, classname, element types), find the content that is
     *               most likely to be the stuff a user wants to read. Then return it wrapped up in a div.
     *
     * @return Element
    **/
    getContentNodes: function () {
        var stripUnlikelyCandidates = readability.flagIsActive(readability.FLAG_STRIP_UNLIKELYS);

        /**
         * First, node prepping. Trash nodes that look cruddy (like ones with the class name "comment", etc), and turn divs
         * into P tags where they have been used inappropriately (as in, where they contain no other block level elements.)
         *
         * Note: Assignment from index for performance. See http://www.peachpit.com/articles/article.aspx?p=31567&seqNum=5
         * TODO: Shouldn't this be a reverse traversal?
        **/
        for(var nodeIndex = 0; (node = document.getElementsByTagName('*')[nodeIndex]); nodeIndex++)
        {
            /* Remove unlikely candidates */
            if (stripUnlikelyCandidates) {
                var unlikelyMatchString = node.className + node.id;
                if (unlikelyMatchString.search(readability.regexps.unlikelyCandidatesRe) !== -1 &&
                    unlikelyMatchString.search(readability.regexps.okMaybeItsACandidateRe) == -1 &&
                        node.tagName !== "BODY")
                {
                    dbg("marking unlikely candidate - " + unlikelyMatchString);
                    node.className += ' fleex-ignore';
                    continue;
                }                               
            }

            /* Turn all divs that don't have children block level elements into p's */
            if (node.tagName === "DIV") {
                if (node.innerHTML.search(readability.regexps.divToPElementsRe) === -1) {
                    dbg("marking content div");
                    node.className += ' fleex-content';
                }
                else
                {
                    /* EXPERIMENTAL */
                    for(var i = 0, il = node.childNodes.length; i < il; i++) {
                        var childNode = node.childNodes[i];
                        if(childNode.nodeType == 3) { // Node.TEXT_NODE
                            dbg("replacing text node with a span tag with the same content.");
                            var p = document.createElement('span');
                            p.innerHTML = childNode.nodeValue;
                            p.className += ' fleex-content';
                            childNode.parentNode.replaceChild(p, childNode);
                        }
                    }
                }
            }
            // Mark p nodes as content
            else if (node.tagName === "P") {
                node.className += ' fleex-content';
            }
        }

        /**
         * Loop through all fleex-content nodes, and assign a score to them based on how content-y they look.
         * Then add their score to their parent node.
         *
         * A score is determined by things like number of commas, class names, etc. Maybe eventually link density.
        **/
        var allContentNodes = document.getElementsByClassName("fleex-content");
        var candidates    = [];

        for (var j=0; j < allContentNodes.length; j++) {
            var currentNode     = allContentNodes[j]; 
            var parentNode      = currentNode.parentNode;
            var grandParentNode = parentNode.parentNode;
            var innerText       = readability.getInnerText(currentNode);

            /* If this node has less than 25 characters, or has been marked as to be ignored, 
               don't even count it. */
            if(innerText.length < 25 || currentNode.className.indexOf('fleex-ignore')!==-1){
                continue;
            }

            /* Initialize readability data for the parent. */
            if(typeof parentNode.readability == 'undefined')
            {
                readability.initializeNode(parentNode);
                candidates.push(parentNode);
            }

            /* Initialize readability data for the grandparent. */
            if(typeof grandParentNode.readability == 'undefined')
            {
                readability.initializeNode(grandParentNode);
                candidates.push(grandParentNode);
            }

            var contentScore = 0;

            /* Add a point for the paragraph itself as a base. */
            contentScore++;

            /* Add points for any commas within this paragraph */
            contentScore += innerText.split(',').length;
            
            /* For every 100 characters in this paragraph, add another point. Up to 3 points. */
            contentScore += Math.min(Math.floor(innerText.length / 100), 3);
            
            /* Add the score to the parent. The grandparent gets half. */
            parentNode.readability.contentScore += contentScore;
            grandParentNode.readability.contentScore += contentScore/2;
        }

        /**
         * After we've calculated scores, loop through all of the possible candidate nodes we found
         * and find the one with the highest score.
        **/
        var topCandidate = null;
        for(var i=0, il=candidates.length; i < il; i++)
        {
            /**
             * Scale the final candidates score based on link density. Good content should have a
             * relatively small link density (5% or less) and be mostly unaffected by this operation.
            **/
            candidates[i].readability.contentScore = candidates[i].readability.contentScore * (1-readability.getLinkDensity(candidates[i]));

            dbg('Candidate: ' + candidates[i] + " (" + candidates[i].className + ":" + candidates[i].id + ") with score " + candidates[i].readability.contentScore);

            if(!topCandidate || candidates[i].readability.contentScore > topCandidate.readability.contentScore){
                topCandidate = candidates[i];
            }
        }

        /**
         * If we still have no top candidate, just use the body as a last resort.
         * We also have to copy the body node so it is something we can modify.
         **/
        if (topCandidate == null || topCandidate.tagName == "BODY")
        {
            topCandidate = document.createElement("DIV");
            topCandidate.innerHTML = document.body.innerHTML;
            document.body.innerHTML = "";
            document.body.appendChild(topCandidate);
            readability.initializeNode(topCandidate);
        }


        /**
         * Now that we have the top candidate, look through its siblings for content that might also be related.
         * Things like preambles, content split by ads that we removed, etc.
        **/
        var res = [];
        var siblingScoreThreshold = Math.max(10, topCandidate.readability.contentScore * 0.2);
        var siblingNodes          = topCandidate.parentNode.childNodes;
        for(var i=0, il=siblingNodes.length; i < il; i++)
        {
            var siblingNode = siblingNodes[i];
            var append      = false;

            dbg("Looking at sibling node: " + siblingNode + " (" + siblingNode.className + ":" + siblingNode.id + ")" + ((typeof siblingNode.readability != 'undefined') ? (" with score " + siblingNode.readability.contentScore) : ''));
            dbg("Sibling has score " + (siblingNode.readability ? siblingNode.readability.contentScore : 'Unknown'));

            if(siblingNode === topCandidate)
            {
                append = true;
            }
            
            if(typeof siblingNode.readability != 'undefined' && siblingNode.readability.contentScore >= siblingScoreThreshold)
            {
                append = true;
            }
            
            if(siblingNode.className.indexOf('fleex-content') !== -1) {
                var linkDensity = readability.getLinkDensity(siblingNode);
                var nodeContent = readability.getInnerText(siblingNode);
                var nodeLength  = nodeContent.length;
                
                if(nodeLength > 80 && linkDensity < 0.25)
                {
                    append = true;
                }
                else if(nodeLength < 80 && linkDensity == 0 && nodeContent.search(/\.( |$)/) !== -1)
                {
                    append = true;
                }
            }

            if(append)
            {
                dbg("Appending node: " + siblingNode);
                res.push(siblingNode);
            }
        }
        
        return res;
    },
    
    /**
     * Get the inner text of a node - cross browser compatibly.
     * This also strips out any excess whitespace to be found.
     *
     * @param Element
     * @return string
    **/
    getInnerText: function (e, normalizeSpaces) {
        var textContent    = "";

        normalizeSpaces = (typeof normalizeSpaces == 'undefined') ? true : normalizeSpaces;

        if (navigator.appName == "Microsoft Internet Explorer"){
            textContent = e.innerText.replace( readability.regexps.trimRe, "" );
        }
        else{
            textContent = e.textContent.replace( readability.regexps.trimRe, "" );
        }

        if(normalizeSpaces){
            return textContent.replace( readability.regexps.normalizeRe, " ");
        }
        else{
            return textContent;
        }
    },
    
    /**
     * Get the density of links as a percentage of the content
     * This is the amount of text that is inside a link divided by the total text in the node.
     * 
     * @param Element
     * @return number (float)
    **/
    getLinkDensity: function (e) {
        var links      = e.getElementsByTagName("a");
        var textLength = readability.getInnerText(e).length;
        var linkLength = 0;
        for(var i=0, il=links.length; i<il;i++)
        {
            linkLength += readability.getInnerText(links[i]).length;
        }               

        return linkLength / textLength;
    },
    
    /**
     * Get an elements class/id weight. Uses regular expressions to tell if this 
     * element looks good or bad.
     *
     * @param Element
     * @return number (Integer)
    **/
    getClassWeight: function (e) {
        if(!readability.flagIsActive(readability.FLAG_WEIGHT_CLASSES)) {
                return 0;
        }

        var weight = 0;

        /* Look for a special classname */
        if (e.className != "")
        {
            if(e.className.search(readability.regexps.negativeRe) !== -1){
                weight -= 25;
            }

            if(e.className.search(readability.regexps.positiveRe) !== -1){
                weight += 25;                           
            }
        }

        /* Look for a special ID */
        if (typeof(e.id) == 'string' && e.id != "")
        {
            if(e.id.search(readability.regexps.negativeRe) !== -1){
                weight -= 25;
            }

            if(e.id.search(readability.regexps.positiveRe) !== -1){
                weight += 25;                           
            }
        }

        return weight;
    },

    flagIsActive: function(flag) {
        return (readability.flags & flag) > 0;
    },
    
    removeFlag: function(flag) {
        readability.flags = readability.flags & ~flag;
    }
};