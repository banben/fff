var dbg = (typeof console !== 'undefined') ? function(s) {
    console.log("Readability: " + s);
} : function() {};

/*
 * Readability. An Arc90 Lab Experiment. 
 * Website: http://lab.arc90.com/experiments/__shoucang_readability__
 * Source:  http://code.google.com/p/arc90labs-__shoucang_readability__
 *
 * "Readability" is a trademark of Arc90 Inc and may not be used without explicit permission. 
 *
 * Copyright (c) 2010 Arc90 Inc
 * Readability is licensed under the Apache License, Version 2.0.
 **/
var __shoucang_readability__ = {
    version: '1.7.1',
    frameHack: false,
    biggestFrame: false,
    flags: 0x1 | 0x2 | 0x4,

    /* constants */
    FLAG_STRIP_UNLIKELYS: 0x1,
    FLAG_WEIGHT_CLASSES: 0x2,
    FLAG_CLEAN_CONDITIONALLY: 0x4,

    dbg: false,

    isCanvasSupported: function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }(),

    /**
     * All of the regular expressions in use within __shoucang_readability__.
     * Defined up here so we don't instantiate them repeatedly in loops.
     **/
    regexps: {
        unlikelyCandidates: /combx|comment|community|disqus|extra|foot|header|menu|remark|rss|shoutbox|sidebar|sponsor|ad-break|agegate|pagination|pager|popup|tweet|twitter/i,
        okMaybeItsACandidate: /and|article|body|column|main|shadow/i,
        positive: /article|body|content|entry|hentry|main|page|pagination|post|text|blog|story/i,
        negative: /combx|comment|com-|contact|foot|footer|footnote|masthead|media|meta|outbrain|promo|related|scroll|shoutbox|sidebar|sponsor|shopping|tags|tool|widget/i,
        extraneous: /print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single/i,
        divToPElements: /<(a|blockquote|dl|div|img|ol|p|pre|table|ul)/i,
        replaceBrs: /(<br[^>]*>[ \n\r\t]*){2,}/gi,
        replaceFonts: /<(\/?)font[^>]*>/gi,
        trim: /^\s+|\s+$/g,
        trimMiddle: /\s+/g,
        normalize: /\s{2,}/g,
        killBreaks: /(<br\s*\/?>(\s|&nbsp;?)*){1,}/g,
        videos: /http:\/\/(www\.)?(youtube|vimeo)\.com/i,
        skipFootnoteLink: /^\s*(\[?[a-z0-9]{1,2}\]?|^|edit|citation needed)\s*$/i,
        nextLink: /(next|weiter|continue|>([^\|]|$)|Â»([^\|]|$))/i, // Match: next, continue, >, >>, Â» but not >|, Â»| as those usually mean last.
        prevLink: /(prev|earl|old|new|<|Â«)/i,
        endPunt: /[\.\,\?\(\)\!\'\"\:\;\-\—\。\？\！\，\、\；\：\“\”\﹃\﹄\﹁\﹂\（\）\［\］\〔\〕\【\】\—\…\《\》\〈\〉\﹏\＿]$/
    },

    /**
     * Runs __shoucang_readability__.
     * 
     * Workflow:
     *  1. Prep the document by removing script tags, css, etc.
     *  2. Build __shoucang_readability__'s DOM tree.
     *  3. Grab the article content from the current dom tree.
     *  4. Replace the current DOM tree with the new one.
     *  5. Read peacefully.
     *
     * @return void
     **/
    init: function() {        
        __shoucang_readability__.cloneDoc = document.cloneNode(document);

        var articleTitle = __shoucang_readability__.getArticleTitle();
        var articleURL = __shoucang_readability__.getArticleURL();
        var articleDesc = __shoucang_readability__.getArticleDesc();
        var articleSiteName = __shoucang_readability__.siteName || '';
        var articleCharset = __shoucang_readability__.getCharset();

        articleTitle = __shoucang_readability__.clipText(articleTitle, 100);
        articleDesc = __shoucang_readability__.clipText(articleDesc, 1000);
        articleSiteName = __shoucang_readability__.clipText(articleSiteName, 100);
        articleCharset = __shoucang_readability__.clipText(articleCharset, 40);

        __shoucang_readability__.postForm(articleTitle, articleURL, articleDesc, articleSiteName, articleCharset);
    },    

    postForm: function(title, url, desc, siteName, charset) {
        var form = document.createElement("form");
        form.setAttribute('method', 'post');
        form.setAttribute('action', 'http://localhost:8000/new');
        form.setAttribute('target', 'TheWindow');
        var titleField = document.createElement("input");
        titleField.setAttribute('name', 'title');
        titleField.setAttribute('value', title);
        form.appendChild(titleField);
        var urlField = document.createElement("input");
        urlField.setAttribute('name', 'url');
        urlField.setAttribute('value', url);
        form.appendChild(urlField);
        var descField = document.createElement("input");
        descField.setAttribute('name', 'desc');
        descField.setAttribute('value', desc);
        form.appendChild(descField);
        var siteNameField = document.createElement("input");
        siteNameField.setAttribute('name', 'siteName');
        siteNameField.setAttribute('value', siteName);
        form.appendChild(siteNameField);
        var charsetField = document.createElement("input");
        charsetField.setAttribute('name', 'charset');
        charsetField.setAttribute('value', charset);
        form.appendChild(charsetField);
        form.style.display = "none";
        document.body.appendChild(form);
        window.open('', 'TheWindow');
        form.submit();
    },

    getCharset: function() {
        return document.charset || document.characterSet || '';
    },


    /**
     * Runs __shoucang_readability__.
     * 
     * Ref:
     *  https://www.geeksforgeeks.org/minimum-length-subarray-sum-greater-given-value/
     *
     * @return [start, end]
     **/
    getSlotMaxDensityIndex: function(arr, x) {
        var n = arr.length;

        // Initialize current sum and minimum length 
        var curr_sum = 0, min_len = n+1; 
      
        // Initialize starting and ending indexes 
        var start = 0, end = 0, min_start = 0; 
        while (end < n) 
        { 
            // Keep adding array elements while current sum 
            // is smaller than x 
            while (curr_sum <= x && end < n) 
            { 
                // Ignore subarrays with negative sum if 
                // x is positive. 
                if (curr_sum <= 0 && x > 0) 
                { 
                    start = end; 
                    curr_sum = 0; 
                } 
      
                curr_sum += arr[end++]; 
            } 
      
            // If current sum becomes greater than x. 
            while (curr_sum > x && start < n) 
            { 
                // Update minimum length if needed 
                if (end - start < min_len) {
                    min_len = end - start; 
                    min_start = start;
                }
      
                // remove starting elements 
                curr_sum -= arr[start++]; 
            } 
        } 
        
        if (min_len == n+1) {
            return [];
        }

        return [min_start, min_start + min_len]; 
    },

    joinArticleSlots: function(slots, idxs) {
        var candidateSlots = slots.slice(idxs[0], idxs[1]);
        var candidateSlotsSeg = candidateSlots.map(function(el) {
            if (__shoucang_readability__.regexps.endPunt.test(el)) {
                return el;
            } else {
                return el + ',';
            }
        });
        return candidateSlotsSeg.join(' ');
    },

    /**
     * Attempts to get excerpt and byline metadata for the article.
     *
     * @return Object with optional "excerpt" and "byline" properties
     */
    getArticleMetadata: function() {
      var metadata = {};
      var values = {};
      var metaElements = document.getElementsByTagName("meta");

      // property is a space-separated list of values
      var propertyPattern = /\s*(dc|dcterm|og|twitter)\s*:\s*(author|creator|description|title|site_name)\s*/gi;

      // name is a single value
      var namePattern = /^\s*(?:(dc|dcterm|og|twitter|weibo:(article|webpage))\s*[\.:]\s*)?(author|creator|description|title|site_name)\s*$/i;

      // Find description tags.
      this._forEachNode(metaElements, function(element) {
        var elementName = element.getAttribute("name");
        var elementProperty = element.getAttribute("property");
        var content = element.getAttribute("content");
        if (!content) {
          return;
        }
        var matches = null;
        var name = null;

        if (elementProperty) {
          matches = elementProperty.match(propertyPattern);
          if (matches) {
            for (var i = matches.length - 1; i >= 0; i--) {
              // Convert to lowercase, and remove any whitespace
              // so we can match below.
              name = matches[i].toLowerCase().replace(/\s/g, "");
              // multiple authors
              values[name] = content.trim();
            }
          }
        }
        if (!matches && elementName && namePattern.test(elementName)) {
          name = elementName;
          if (content) {
            // Convert to lowercase, remove any whitespace, and convert dots
            // to colons so we can match below.
            name = name.toLowerCase().replace(/\s/g, "").replace(/\./g, ":");
            values[name] = content.trim();
          }
        }
      });

      // get description
      metadata.excerpt = values["dc:description"] ||
                         values["dcterm:description"] ||
                         values["og:description"] ||
                         values["weibo:article:description"] ||
                         values["weibo:webpage:description"] ||
                         values["description"] ||
                         values["twitter:description"];
      if (metadata.excerpt) {
          metadata.excerpt = metadata.excerpt.replace(__shoucang_readability__.regexps.trim, '');
          metadata.excerpt = metadata.excerpt.replace(__shoucang_readability__.regexps.trimMiddle, ' ');
          metadata.excerpt = __shoucang_readability__.parseHtmlEntities(metadata.excerpt);
      }

      // get site name
      metadata.siteName = values["og:site_name"];

      if (metadata.siteName) {
          __shoucang_readability__.siteName = metadata.siteName; 
      }
      
      return metadata;
    },

    /**
     * Iterate over a NodeList, which doesn't natively fully implement the Array
     * interface.
     *
     * For convenience, the current object context is applied to the provided
     * iterate function.
     *
     * @param  NodeList nodeList The NodeList.
     * @param  Function fn       The iterate function.
     * @return void
     */
    _forEachNode: function(nodeList, fn) {
      Array.prototype.forEach.call(nodeList, fn, this);
    },

    getArticleDesc: function() {
        var meta = __shoucang_readability__.getArticleMetadata();
        if (meta.excerpt) {
            if (__shoucang_readability__.isCanvasSupported) {
                if (__shoucang_readability__.getWidthOfText(meta.excerpt, '"Helvetica Neue",Helvetica,Arial,sans-serif', '13px') > 310) {
                    return meta.excerpt;
                }
            } else {
                if (__shoucang_readability__.getWidthOfText(meta.excerpt, '"Helvetica Neue",Helvetica,Arial,sans-serif', '13px') > 55) {
                    return meta.excerpt;
                }
            }
        }

        __shoucang_readability__.removeScripts(__shoucang_readability__.cloneDoc);
        __shoucang_readability__.prepDocument(__shoucang_readability__.cloneDoc);
        var articleContent = __shoucang_readability__.grabArticle(__shoucang_readability__.cloneDoc.body);

        if (!articleContent) {
            return '';
        }

        var articleSlot = articleContent.innerText.split('\n');
        var articleSlotFiltered = articleSlot.filter(function(el) {
            return el.trim().length > 0;
        });
        var articleSlotCleaned = articleSlotFiltered.map(function(el) {
            return el.replace(__shoucang_readability__.regexps.trim, "").replace(__shoucang_readability__.regexps.trimMiddle, " ");
        });
        var articleSlotLens = articleSlotCleaned.map(function(el) {
            return __shoucang_readability__.getWidthOfText(el, '"Helvetica Neue",Helvetica,Arial,sans-serif', '13px');
        });

        var slotMaxDensityIndex;
        if (__shoucang_readability__.isCanvasSupported) {
            slotMaxDensityIndex = __shoucang_readability__.getSlotMaxDensityIndex(articleSlotLens, 310); 
        } else {
            slotMaxDensityIndex = __shoucang_readability__.getSlotMaxDensityIndex(articleSlotLens, 55);
        }

        if (slotMaxDensityIndex) {
            return __shoucang_readability__.joinArticleSlots(articleSlotCleaned, slotMaxDensityIndex);
        }

        return meta.excerpt || '';
    },  

    /**
     * Prepare the HTML document for __shoucang_readability__ to scrape it.
     * This includes things like stripping javascript, CSS, and handling terrible markup.
     * 
     * @return void
     **/
    prepDocument: function(doc) {
        /**
         * In some cases a body element can't be found (if the HTML is totally hosed for example)
         * so we create a new body node and append it to the document.
         */
        // if (document.body === null) {
        //     var body = __shoucang_readability__.cloneDoc.createElement("body");
        //     try {
        //         document.body = body;
        //     } catch (e) {
        //         document.documentElement.appendChild(body);
        //         dbg(e);
        //     }
        // }

        // document.body.id = "__shoucang_readability__Body";

        var frames = doc.getElementsByTagName('frame');
        if (frames.length > 0) {
            var bestFrame = null;
            var bestFrameSize = 0; /* The frame to try to run __shoucang_readability__ upon. Must be on same domain. */
            var biggestFrameSize = 0; /* Used for the error message. Can be on any domain. */
            for (var frameIndex = 0; frameIndex < frames.length; frameIndex++) {
                var frameSize = frames[frameIndex].offsetWidth + frames[frameIndex].offsetHeight;
                var canAccessFrame = false;
                try {
                    frames[frameIndex].contentWindow.document.body;
                    canAccessFrame = true;
                } catch (eFrames) {
                    dbg(eFrames);
                }

                if (frameSize > biggestFrameSize) {
                    biggestFrameSize = frameSize;
                    __shoucang_readability__.biggestFrame = frames[frameIndex];
                }

                if (canAccessFrame && frameSize > bestFrameSize) {
                    __shoucang_readability__.frameHack = true;

                    bestFrame = frames[frameIndex];
                    bestFrameSize = frameSize;
                }
            }

            if (bestFrame) {
                var newBody = __shoucang_readability__.cloneDoc.createElement('body');
                newBody.innerHTML = bestFrame.contentWindow.document.body.innerHTML;
                newBody.style.overflow = 'scroll';
                doc.body = newBody;

                var frameset = doc.getElementsByTagName('frameset')[0];
                if (frameset) {
                    frameset.parentNode.removeChild(frameset);
                }
            }
        }

        /* Remove all stylesheets */
        for (var k = 0; k < doc.styleSheets.length; k++) {
            if (doc.styleSheets[k].href !== null && doc.styleSheets[k].href.lastIndexOf("__shoucang_readability__") == -1) {
                doc.styleSheets[k].disabled = true;
            }
        }

        /* Remove all style tags in head (not doing this on IE) - TODO: Why not? */
        var styleTags = doc.getElementsByTagName("style");
        for (var st = 0; st < styleTags.length; st++) {
            styleTags[st].textContent = "";
        }

        /* Turn all double br's into p's */
        /* Note, this is pretty costly as far as processing goes. Maybe optimize later. */
        doc.body.innerHTML = doc.body.innerHTML.replace(__shoucang_readability__.regexps.replaceBrs, '</p><p>').replace(__shoucang_readability__.regexps.replaceFonts, '<$1span>');
    },

    /**
     * Prepare the article node for display. Clean out any inline styles,
     * iframes, forms, strip extraneous <p> tags, etc.
     *
     * @param Element
     * @return void
     **/
    prepArticle: function(articleContent) {
        __shoucang_readability__.cleanStyles(articleContent);
        __shoucang_readability__.killBreaks(articleContent);

        /* Clean out junk from the article content */
        __shoucang_readability__.cleanConditionally(articleContent, "form");
        __shoucang_readability__.clean(articleContent, "object");
        __shoucang_readability__.clean(articleContent, "h1");

        /**
         * If there is only one h2, they are probably using it
         * as a header and not a subheader, so remove it since we already have a header.
         ***/
        if (articleContent.getElementsByTagName('h2').length == 1) {
            __shoucang_readability__.clean(articleContent, "h2");
        }
        __shoucang_readability__.clean(articleContent, "iframe");

        __shoucang_readability__.cleanHeaders(articleContent);

        /* Do these last as the previous stuff may have removed junk that will affect these */
        __shoucang_readability__.cleanConditionally(articleContent, "table");
        __shoucang_readability__.cleanConditionally(articleContent, "ul");
        __shoucang_readability__.cleanConditionally(articleContent, "div");

        /* Remove extra paragraphs */
        var articleParagraphs = articleContent.getElementsByTagName('p');
        for (var i = articleParagraphs.length - 1; i >= 0; i--) {
            var imgCount = articleParagraphs[i].getElementsByTagName('img').length;
            var embedCount = articleParagraphs[i].getElementsByTagName('embed').length;
            var objectCount = articleParagraphs[i].getElementsByTagName('object').length;

            if (imgCount === 0 && embedCount === 0 && objectCount === 0 && __shoucang_readability__.getInnerText(articleParagraphs[i], false) == '') {
                articleParagraphs[i].parentNode.removeChild(articleParagraphs[i]);
            }
        }

        try {
            articleContent.innerHTML = articleContent.innerHTML.replace(/<br[^>]*>\s*<p/gi, '<p');
        } catch (e) {
            if (__shoucang_readability__.dbg) {
                dbg("Cleaning innerHTML of breaks failed. This is an IE strict-block-elements bug. Ignoring.: " + e);
            }
        }
    },

    /**
     * Initialize a node with the __shoucang_readability__ object. Also checks the
     * className/id for special names to add to its score.
     *
     * @param Element
     * @return void
     **/
    initializeNode: function(node) {
        node.__shoucang_readability__ = {
            "contentScore": 0
        };

        switch (node.tagName) {
            case 'DIV':
                node.__shoucang_readability__.contentScore += 5;
                break;

            case 'PRE':
            case 'TD':
            case 'BLOCKQUOTE':
                node.__shoucang_readability__.contentScore += 3;
                break;

            case 'ADDRESS':
            case 'OL':
            case 'UL':
            case 'DL':
            case 'DD':
            case 'DT':
            case 'LI':
            case 'FORM':
                node.__shoucang_readability__.contentScore -= 3;
                break;

            case 'H1':
            case 'H2':
            case 'H3':
            case 'H4':
            case 'H5':
            case 'H6':
            case 'TH':
                node.__shoucang_readability__.contentScore -= 5;
                break;
        }

        node.__shoucang_readability__.contentScore += __shoucang_readability__.getClassWeight(node);
    },

    /***
     * grabArticle - Using a variety of metrics (content score, classname, element types), find the content that is
     *               most likely to be the stuff a user wants to read. Then return it wrapped up in a div.
     *
     * @param page a document to run upon. Needs to be a full document, complete with body.
     * @return Element
     **/
    grabArticle: function(body) {
        var stripUnlikelyCandidates = __shoucang_readability__.flagIsActive(__shoucang_readability__.FLAG_STRIP_UNLIKELYS),
            isPaging = (body !== null) ? true : false;

        var pageCacheHtml = body.innerHTML;

        var allElements = body.getElementsByTagName('*');

        /**
         * First, node prepping. Trash nodes that look cruddy (like ones with the class name "comment", etc), and turn divs
         * into P tags where they have been used inappropriately (as in, where they contain no other block level elements.)
         *
         * Note: Assignment from index for performance. See http://www.peachpit.com/articles/article.aspx?p=31567&seqNum=5
         * TODO: Shouldn't this be a reverse traversal?
         **/
        var node = null;
        var nodesToScore = [];
        for (var nodeIndex = 0;
            (node = allElements[nodeIndex]); nodeIndex++) {
            /* Remove unlikely candidates */
            if (stripUnlikelyCandidates) {
                var unlikelyMatchString = node.className + node.id;
                if (
                    (
                        unlikelyMatchString.search(__shoucang_readability__.regexps.unlikelyCandidates) !== -1 &&
                        unlikelyMatchString.search(__shoucang_readability__.regexps.okMaybeItsACandidate) == -1 &&
                        node.tagName !== "BODY"
                    )
                ) {
                    if (__shoucang_readability__.dbg) {
                        dbg("Removing unlikely candidate - " + unlikelyMatchString);
                    }
                    node.parentNode.removeChild(node);
                    nodeIndex--;
                    continue;
                }
            }

            if (node.tagName === "P" || node.tagName === "TD" || node.tagName === "PRE") {
                nodesToScore[nodesToScore.length] = node;
            }

            /* Turn all divs that don't have children block level elements into p's */
            if (node.tagName === "DIV") {
                if (node.innerHTML.search(__shoucang_readability__.regexps.divToPElements) === -1) {
                    var newNode = __shoucang_readability__.cloneDoc.createElement('p');
                    try {
                        newNode.innerHTML = node.innerHTML;
                        node.parentNode.replaceChild(newNode, node);
                        nodeIndex--;

                        nodesToScore[nodesToScore.length] = node;
                    } catch (e) {
                        if (__shoucang_readability__.dbg) {
                            dbg("Could not alter div to p, probably an IE restriction, reverting back to div.: " + e);
                        }
                    }
                } else {
                    /* EXPERIMENTAL */
                    for (var i = 0, il = node.childNodes.length; i < il; i++) {
                        var childNode = node.childNodes[i];
                        if (childNode.nodeType == 3) { // Node.TEXT_NODE
                            var p = __shoucang_readability__.cloneDoc.createElement('p');
                            p.innerHTML = childNode.nodeValue;
                            p.style.display = 'inline';
                            p.className = '__shoucang_readability__-styled';
                            childNode.parentNode.replaceChild(p, childNode);
                        }
                    }
                }
            }
        }

        /**
         * Loop through all paragraphs, and assign a score to them based on how content-y they look.
         * Then add their score to their parent node.
         *
         * A score is determined by things like number of commas, class names, etc. Maybe eventually link density.
         **/
        var candidates = [];
        for (var pt = 0; pt < nodesToScore.length; pt++) {
            var parentNode = nodesToScore[pt].parentNode;
            var grandParentNode = parentNode ? parentNode.parentNode : null;
            var innerText = __shoucang_readability__.getInnerText(nodesToScore[pt]);

            if (!parentNode || typeof(parentNode.tagName) == 'undefined') {
                continue;
            }

            /* If this paragraph is less than 25 characters, don't even count it. */
            if (innerText.length < 25) {
                continue;
            }

            /* Initialize __shoucang_readability__ data for the parent. */
            if (typeof parentNode.__shoucang_readability__ == 'undefined') {
                __shoucang_readability__.initializeNode(parentNode);
                candidates.push(parentNode);
            }

            /* Initialize __shoucang_readability__ data for the grandparent. */
            if (grandParentNode && typeof(grandParentNode.__shoucang_readability__) == 'undefined' && typeof(grandParentNode.tagName) != 'undefined') {
                __shoucang_readability__.initializeNode(grandParentNode);
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
            parentNode.__shoucang_readability__.contentScore += contentScore;

            if (grandParentNode) {
                grandParentNode.__shoucang_readability__.contentScore += contentScore / 2;
            }
        }

        /**
         * After we've calculated scores, loop through all of the possible candidate nodes we found
         * and find the one with the highest score.
         **/
        var topCandidate = null;
        for (var c = 0, cl = candidates.length; c < cl; c++) {
            /**
             * Scale the final candidates score based on link density. Good content should have a
             * relatively small link density (5% or less) and be mostly unaffected by this operation.
             **/
            candidates[c].__shoucang_readability__.contentScore = candidates[c].__shoucang_readability__.contentScore * (1 - __shoucang_readability__.getLinkDensity(candidates[c]));

            if (__shoucang_readability__.dbg) {
                dbg('Candidate: ' + candidates[c] + " (" + candidates[c].className + ":" + candidates[c].id + ") with score " + candidates[c].__shoucang_readability__.contentScore);
            }

            if (!topCandidate || candidates[c].__shoucang_readability__.contentScore > topCandidate.__shoucang_readability__.contentScore) {
                topCandidate = candidates[c];
            }
        }

        /**
         * If we still have no top candidate, just use the body as a last resort.
         * We also have to copy the body node so it is something we can modify.
         **/
        if (topCandidate === null || topCandidate.tagName == "BODY") {
            topCandidate = __shoucang_readability__.cloneDoc.createElement("DIV");
            topCandidate.innerHTML = body.innerHTML;
            body.innerHTML = "";
            body.appendChild(topCandidate);
            __shoucang_readability__.initializeNode(topCandidate);
        }

        /**
         * Now that we have the top candidate, look through its siblings for content that might also be related.
         * Things like preambles, content split by ads that we removed, etc.
         **/
        var articleContent = __shoucang_readability__.cloneDoc.createElement("DIV");
        if (isPaging) {
            articleContent.id = "__shoucang_readability__-content";
        }
        var siblingScoreThreshold = Math.max(10, topCandidate.__shoucang_readability__.contentScore * 0.2);
        var siblingNodes = topCandidate.parentNode.childNodes;


        for (var s = 0, sl = siblingNodes.length; s < sl; s++) {
            var siblingNode = siblingNodes[s];
            var append = false;

            /**
             * Fix for odd IE7 Crash where siblingNode does not exist even though this should be a live nodeList.
             * Example of error visible here: http://www.esquire.com/features/honesty0707
             **/
            if (!siblingNode) {
                continue;
            }

            if (__shoucang_readability__.dbg) {
                dbg("Looking at sibling node: " + siblingNode + " (" + siblingNode.className + ":" + siblingNode.id + ")" + ((typeof siblingNode.__shoucang_readability__ != 'undefined') ? (" with score " + siblingNode.__shoucang_readability__.contentScore) : ''));
                dbg("Sibling has score " + (siblingNode.__shoucang_readability__ ? siblingNode.__shoucang_readability__.contentScore : 'Unknown'));
            }

            if (siblingNode === topCandidate) {
                append = true;
            }

            var contentBonus = 0;
            /* Give a bonus if sibling nodes and top candidates have the example same classname */
            if (siblingNode.className == topCandidate.className && topCandidate.className != "") {
                contentBonus += topCandidate.__shoucang_readability__.contentScore * 0.2;
            }

            if (typeof siblingNode.__shoucang_readability__ != 'undefined' && (siblingNode.__shoucang_readability__.contentScore + contentBonus) >= siblingScoreThreshold) {
                append = true;
            }

            if (siblingNode.nodeName == "P") {
                var linkDensity = __shoucang_readability__.getLinkDensity(siblingNode);
                var nodeContent = __shoucang_readability__.getInnerText(siblingNode);
                var nodeLength = nodeContent.length;

                if (nodeLength > 80 && linkDensity < 0.25) {
                    append = true;
                } else if (nodeLength < 80 && linkDensity === 0 && nodeContent.search(/\.( |$)/) !== -1) {
                    append = true;
                }
            }

            if (append) {
                if (__shoucang_readability__.dbg) {
                    dbg("Appending node: " + siblingNode);
                }

                var nodeToAppend = null;
                if (siblingNode.nodeName != "DIV" && siblingNode.nodeName != "P") {
                    /* We have a node that isn't a common block level element, like a form or td tag. Turn it into a div so it doesn't get filtered out later by accident. */

                    if (__shoucang_readability__.dbg) {
                        dbg("Altering siblingNode of " + siblingNode.nodeName + ' to div.');
                    }
                    nodeToAppend = __shoucang_readability__.cloneDoc.createElement("DIV");
                    try {
                        nodeToAppend.id = siblingNode.id;
                        nodeToAppend.innerHTML = siblingNode.innerHTML;
                    } catch (er) {
                        if (__shoucang_readability__.dbg) {
                            dbg("Could not alter siblingNode to div, probably an IE restriction, reverting back to original.");
                        }
                        nodeToAppend = siblingNode;
                        s--;
                        sl--;
                    }
                } else {
                    nodeToAppend = siblingNode;
                    s--;
                    sl--;
                }

                /* To ensure a node does not interfere with __shoucang_readability__ styles, remove its classnames */
                nodeToAppend.className = "";

                /* Append sibling and subtract from our list because it removes the node when you append to another node */
                articleContent.appendChild(nodeToAppend);
            }
        }

        /**
         * So we have all of the content that we need. Now we clean it up for presentation.
         **/
        __shoucang_readability__.prepArticle(articleContent);

        if (__shoucang_readability__.curPageNum === 1) {
            articleContent.innerHTML = '<div id="__shoucang_readability__-page-1" class="page">' + articleContent.innerHTML + '</div>';
        }

        /**
         * Now that we've gone through the full algorithm, check to see if we got any meaningful content.
         * If we didn't, we may need to re-run grabArticle with different flags set. This gives us a higher
         * likelihood of finding the content, and the sieve approach gives us a higher likelihood of
         * finding the -right- content.
         **/
        if (__shoucang_readability__.getInnerText(articleContent, false).length < 250) {
            body.innerHTML = pageCacheHtml;

            if (__shoucang_readability__.flagIsActive(__shoucang_readability__.FLAG_STRIP_UNLIKELYS)) {
                __shoucang_readability__.removeFlag(__shoucang_readability__.FLAG_STRIP_UNLIKELYS);
                return __shoucang_readability__.grabArticle(body);
            } else if (__shoucang_readability__.flagIsActive(__shoucang_readability__.FLAG_WEIGHT_CLASSES)) {
                __shoucang_readability__.removeFlag(__shoucang_readability__.FLAG_WEIGHT_CLASSES);
                return __shoucang_readability__.grabArticle(body);
            } else if (__shoucang_readability__.flagIsActive(__shoucang_readability__.FLAG_CLEAN_CONDITIONALLY)) {
                __shoucang_readability__.removeFlag(__shoucang_readability__.FLAG_CLEAN_CONDITIONALLY);
                return __shoucang_readability__.grabArticle(body);
            } else {
                return null;
            }
        }

        return articleContent;
    },

    /**
     * Get the article title as an H1.
     *
     * @return void
     **/
    getArticleTitle: function() {
        var curTitle = document.title;
        curTitle = curTitle.replace(__shoucang_readability__.regexps.trim, "");
        if (!curTitle) {
            curTitle = window.location.href;
        }
        return curTitle;
    },

    /**
     * Get the article title as an H1.
     *
     * @return void
     **/
    getArticleURL: function() {
        return window.location.href;
    },

    /**
     * Removes script tags from the document.
     *
     * @param Element
     **/
    removeScripts: function(doc) {
        var scripts = doc.getElementsByTagName('script');
        for (var i = scripts.length - 1; i >= 0; i--) {
            if (typeof(scripts[i].src) == "undefined" || (scripts[i].src.indexOf('__shoucang_readability__') == -1 && scripts[i].src.indexOf('typekit') == -1)) {
                scripts[i].nodeValue = "";
                scripts[i].removeAttribute('src');
                if (scripts[i].parentNode) {
                    scripts[i].parentNode.removeChild(scripts[i]);
                }
            }
        }
    },

    /**
     * Get the inner text of a node - cross browser compatibly.
     * This also strips out any excess whitespace to be found.
     *
     * @param Element
     * @return string
     **/
    getInnerText: function(e, normalizeSpaces) {
        var textContent = "";

        if (typeof(e.textContent) == "undefined" && typeof(e.innerText) == "undefined") {
            return "";
        }

        normalizeSpaces = (typeof normalizeSpaces == 'undefined') ? true : normalizeSpaces;

        if (navigator.appName == "Microsoft Internet Explorer") {
            textContent = e.innerText.replace(__shoucang_readability__.regexps.trim, "");
        } else {
            textContent = e.textContent.replace(__shoucang_readability__.regexps.trim, "");
        }

        if (normalizeSpaces) {
            return textContent.replace(__shoucang_readability__.regexps.normalize, " ");
        } else {
            return textContent;
        }
    },

    /**
     * Get the number of times a string s appears in the node e.
     *
     * @param Element
     * @param string - what to split on. Default is ","
     * @return number (integer)
     **/
    getCharCount: function(e, s) {
        s = s || ",";
        return __shoucang_readability__.getInnerText(e).split(s).length - 1;
    },

    /**
     * Remove the style attribute on every e and under.
     * TODO: Test if getElementsByTagName(*) is faster.
     *
     * @param Element
     * @return void
     **/
    cleanStyles: function(e) {
        e = e || document;
        var cur = e.firstChild;

        if (!e) {
            return;
        }

        // Remove any root styles, if we're able.
        if (typeof e.removeAttribute == 'function' && e.className != '__shoucang_readability__-styled') {
            e.removeAttribute('style');
        }

        // Go until there are no more child nodes
        while (cur !== null) {
            if (cur.nodeType == 1) {
                // Remove style attribute(s) :
                if (cur.className != "__shoucang_readability__-styled") {
                    cur.removeAttribute("style");
                }
                __shoucang_readability__.cleanStyles(cur);
            }
            cur = cur.nextSibling;
        }
    },

    /**
     * Get the density of links as a percentage of the content
     * This is the amount of text that is inside a link divided by the total text in the node.
     * 
     * @param Element
     * @return number (float)
     **/
    getLinkDensity: function(e) {
        var links = e.getElementsByTagName("a");
        var textLength = __shoucang_readability__.getInnerText(e).length;
        var linkLength = 0;
        for (var i = 0, il = links.length; i < il; i++) {
            linkLength += __shoucang_readability__.getInnerText(links[i]).length;
        }

        return linkLength / textLength;
    },

    /**
     * Make an AJAX request for each page and append it to the document.
     **/
    curPageNum: 1,

    /**
     * Get an elements class/id weight. Uses regular expressions to tell if this 
     * element looks good or bad.
     *
     * @param Element
     * @return number (Integer)
     **/
    getClassWeight: function(e) {
        if (!__shoucang_readability__.flagIsActive(__shoucang_readability__.FLAG_WEIGHT_CLASSES)) {
            return 0;
        }

        var weight = 0;

        /* Look for a special classname */
        if (typeof(e.className) === 'string' && e.className != '') {
            if (e.className.search(__shoucang_readability__.regexps.negative) !== -1) {
                weight -= 25;
            }

            if (e.className.search(__shoucang_readability__.regexps.positive) !== -1) {
                weight += 25;
            }
        }

        /* Look for a special ID */
        if (typeof(e.id) === 'string' && e.id != '') {
            if (e.id.search(__shoucang_readability__.regexps.negative) !== -1) {
                weight -= 25;
            }

            if (e.id.search(__shoucang_readability__.regexps.positive) !== -1) {
                weight += 25;
            }
        }

        return weight;
    },

    /**
     * Remove extraneous break tags from a node.
     *
     * @param Element
     * @return void
     **/
    killBreaks: function(e) {
        try {
            e.innerHTML = e.innerHTML.replace(__shoucang_readability__.regexps.killBreaks, '<br />');
        } catch (eBreaks) {
            if (__shoucang_readability__.dbg) {
                dbg("KillBreaks failed - this is an IE bug. Ignoring.: " + eBreaks);
            }
        }
    },

    /**
     * Clean a node of all elements of type "tag".
     * (Unless it's a youtube/vimeo video. People love movies.)
     *
     * @param Element
     * @param string tag to clean
     * @return void
     **/
    clean: function(e, tag) {
        var targetList = e.getElementsByTagName(tag);
        var isEmbed = (tag == 'object' || tag == 'embed');

        for (var y = targetList.length - 1; y >= 0; y--) {
            /* Allow youtube and vimeo videos through as people usually want to see those. */
            if (isEmbed) {
                var attributeValues = "";
                for (var i = 0, il = targetList[y].attributes.length; i < il; i++) {
                    attributeValues += targetList[y].attributes[i].value + '|';
                }

                /* First, check the elements attributes to see if any of them contain youtube or vimeo */
                if (attributeValues.search(__shoucang_readability__.regexps.videos) !== -1) {
                    continue;
                }

                /* Then check the elements inside this element for the same. */
                if (targetList[y].innerHTML.search(__shoucang_readability__.regexps.videos) !== -1) {
                    continue;
                }

            }

            targetList[y].parentNode.removeChild(targetList[y]);
        }
    },

    /**
     * Clean an element of all tags of type "tag" if they look fishy.
     * "Fishy" is an algorithm based on content length, classnames, link density, number of images & embeds, etc.
     *
     * @return void
     **/
    cleanConditionally: function(e, tag) {

        if (!__shoucang_readability__.flagIsActive(__shoucang_readability__.FLAG_CLEAN_CONDITIONALLY)) {
            return;
        }

        var tagsList = e.getElementsByTagName(tag);
        var curTagsLength = tagsList.length;

        /**
         * Gather counts for other typical elements embedded within.
         * Traverse backwards so we can remove nodes at the same time without effecting the traversal.
         *
         * TODO: Consider taking into account original contentScore here.
         **/
        for (var i = curTagsLength - 1; i >= 0; i--) {
            var weight = __shoucang_readability__.getClassWeight(tagsList[i]);
            var contentScore = (typeof tagsList[i].__shoucang_readability__ != 'undefined') ? tagsList[i].__shoucang_readability__.contentScore : 0;

            if (__shoucang_readability__.dbg) {
                dbg("Cleaning Conditionally " + tagsList[i] + " (" + tagsList[i].className + ":" + tagsList[i].id + ")" + ((typeof tagsList[i].__shoucang_readability__ != 'undefined') ? (" with score " + tagsList[i].__shoucang_readability__.contentScore) : ''));
            }

            if (weight + contentScore < 0) {
                tagsList[i].parentNode.removeChild(tagsList[i]);
            } else if (__shoucang_readability__.getCharCount(tagsList[i], ',') < 10) {
                /**
                 * If there are not very many commas, and the number of
                 * non-paragraph elements is more than paragraphs or other ominous signs, remove the element.
                 **/
                var p = tagsList[i].getElementsByTagName("p").length;
                var img = tagsList[i].getElementsByTagName("img").length;
                var li = tagsList[i].getElementsByTagName("li").length - 100;
                var input = tagsList[i].getElementsByTagName("input").length;

                var embedCount = 0;
                var embeds = tagsList[i].getElementsByTagName("embed");
                for (var ei = 0, il = embeds.length; ei < il; ei++) {
                    if (embeds[ei].src.search(__shoucang_readability__.regexps.videos) == -1) {
                        embedCount++;
                    }
                }

                var linkDensity = __shoucang_readability__.getLinkDensity(tagsList[i]);
                var contentLength = __shoucang_readability__.getInnerText(tagsList[i]).length;
                var toRemove = false;

                if (img > p) {
                    toRemove = true;
                } else if (li > p && tag != "ul" && tag != "ol") {
                    toRemove = true;
                } else if (input > Math.floor(p / 3)) {
                    toRemove = true;
                } else if (contentLength < 25 && (img === 0 || img > 2)) {
                    toRemove = true;
                } else if (weight < 25 && linkDensity > 0.2) {
                    toRemove = true;
                } else if (weight >= 25 && linkDensity > 0.5) {
                    toRemove = true;
                } else if ((embedCount == 1 && contentLength < 75) || embedCount > 1) {
                    toRemove = true;
                }

                if (toRemove) {
                    tagsList[i].parentNode.removeChild(tagsList[i]);
                }
            }
        }
    },

    /**
     * Clean out spurious headers from an Element. Checks things like classnames and link density.
     *
     * @param Element
     * @return void
     **/
    cleanHeaders: function(e) {
        for (var headerIndex = 1; headerIndex < 3; headerIndex++) {
            var headers = e.getElementsByTagName('h' + headerIndex);
            for (var i = headers.length - 1; i >= 0; i--) {
                if (__shoucang_readability__.getClassWeight(headers[i]) < 0 || __shoucang_readability__.getLinkDensity(headers[i]) > 0.33) {
                    headers[i].parentNode.removeChild(headers[i]);
                }
            }
        }
    },

    flagIsActive: function(flag) {
        return (__shoucang_readability__.flags & flag) > 0;
    },

    addFlag: function(flag) {
        __shoucang_readability__.flags = __shoucang_readability__.flags | flag;
    },

    removeFlag: function(flag) {
        __shoucang_readability__.flags = __shoucang_readability__.flags & ~flag;
    },

    countUtf8Bytes: function(s) {
        var b = 0, i = 0, c;
        for(;c=s.charCodeAt(i++);b+=c>>11?2:c>>7?2:1);
        return b;
    },

    getWidthOfText: function(txt, fontname, fontsize) {
        if(__shoucang_readability__.getWidthOfText.c === undefined){
            if (__shoucang_readability__.isCanvasSupported) {
                __shoucang_readability__.getWidthOfText.c = document.createElement('canvas');
                __shoucang_readability__.getWidthOfText.ctx = __shoucang_readability__.getWidthOfText.c.getContext('2d');  
            } else {
                __shoucang_readability__.getWidthOfText.ctx = {
                    measureText: __shoucang_readability__.countUtf8Bytes
                };
            }
        }
        __shoucang_readability__.getWidthOfText.ctx.font = fontsize + ' ' + fontname;
        return __shoucang_readability__.getWidthOfText.ctx.measureText(txt).width;
    },

    parseHtmlEntities: function(str) {
        str = str
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'");
        return str.replace(/&#([0-9]{1,3});/gi, function(match, numStr) {
            var num = parseInt(numStr, 10); // read num as normal number
            return String.fromCharCode(num);
        });
    },

    clipText: function(txt, threshold) {
        return txt.length > threshold ? txt.substring(0, threshold) : txt;
    }

};

__shoucang_readability__.init();
