 const url = 'Wiki.pdf'; /*WRITE THE PATH TO THE LOCAL FOLFER*/
            
            let pdfDoc = null,
                pageNum = 1,
                pageIsRendering = false,
                pageNumIsPending = null,
                scale = 1.5;
            
            const canvas = document.querySelector('#pdf-render'),
                  ctx = canvas.getContext('2d');
            
            //Render the page
            const renderPage = num => {
                pageIsRendering = true;
                console.log(num);
                
                pdfDoc.getPage(num).then(page => {
                    const viewport = page.getViewport({ scale });
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    const renderCtx = {
                        canvasContext: ctx,
                        viewport
                    }
                    
                    page.render(renderCtx).promise.then(() => {
                        pageIsRendering = false;
                        
                        if(pageNumIsPending != null) {
                            renderPage(pageNumIsPending);
                            pageNumIsPending = null;
                        }
                    });
                    
                    document.querySelector('#page-num').textContent = num;
                });
            };



            const checkRenderPage = num => {
                if(pageIsRendering) {
                    pageNumIsPending = num;
                } else {
                    renderPage(num);
                }
            }
            
            const showPrevPage = () => {
                if(pageNum <= 1) {
                    return;
                } 
                pageNum--;
                checkRenderPage(pageNum);
            }
            
            const showNextPage = () => {
                if(pageNum >= pdfDoc.numPages) {
                    return;
                } 
                pageNum++;
                checkRenderPage(pageNum);
            }
        
        
        var changePages = function(e) {
            if(e.which === 33){
                if(pageNum <= 1) {
                    return;
                } 
                pageNum--;
                checkRenderPage(pageNum);
            } else if(e.which === 34){
                if(pageNum >= pdfDoc.numPages) {
                    return;
                } 
                pageNum++;
                checkRenderPage(pageNum);
            } else if(e.which === 88 && e.shiftKey){
                if(pageNum <= 1) {
                    console.log('Hi')
                    return;
                }
                pageNum = pageNum - (pageNum - 1);
                checkRenderPage(pageNum);
            } else if(e.which === 67 && e.shiftKey) {
                if(pageNum >= pdfDoc.numPages) {
                    return;
                }
                pageNum = pdfDoc.numPages;
                checkRenderPage(pageNum);
            }
        }   
        
        document.onkeydown = changePages;
            

            
           const zoomIn = () => {
                scale = scale + 0.15;
                checkRenderPage(pageNum);
            }
            
            const zoomOut = () => {
                if(scale <= 0.15) {
                    return;
                }
                scale = scale - 0.15;
                checkRenderPage(pageNum);
            }
            
            
            document.addEventListener("keydown", function(event) {
              console.log(event.which);
                if (event.keyCode == 109){
                    if(scale <= 0.15) {
                        return;
                    }
                    scale = scale - 0.15;
                    debugger
                    checkRenderPage(pageNum);
                } else if (event.keyCode == 107) {
                    scale = scale + 0.15;
                    checkRenderPage(pageNum);
                }
            })

            
            document.querySelector('#pdf-render').addEventListener("mousemove", function(e) {
                document.getElementById('x-value').textContent = e.clientX;
                document.getElementById('y-value').textContent = e.clientY;
            })
             
            //Get Document
            pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
                pdfDoc = pdfDoc_;
                
                document.querySelector('#page-count').textContent = pdfDoc.numPages;
                
                renderPage(pageNum)
            })


            function countWords(pdfUrl){
                var pdf = pdfjsLib.getDocument(url);
                return pdf.then(function(pdf) { // calculate total count for document
                     var maxPages = pdfDoc.numPages;
                     var countPromises = []; // collecting all page promises
                     for (var j = 1; j <= maxPages; j++) {
                        var page = pdf.getPage(j);

                        var txt = "";
                        countPromises.push(page.then(function(page) { // add page promise
                            var textContent = page.getTextContent();
                            return textContent.then(function(page){ // return content promise

                            for(var i=0;i<page.items.length;i++){
                                txtadd = page.items[i].str
                                txt += txtadd.replace(/[^a-zA-Z0-9:;,.?!-() ]/g,'');
                            }
                                console.log(txt);
                                return txt.split(" ").length; // value for page words

                            });
                        }));
                     }
                     // Wait for all pages and sum counts
                     return Promise.all(countPromises).then(function (counts) {
                       var count = 0;
                       counts.forEach(function (c) { count += c; });
                       return count;
                     });
                });
                }
                // waiting on countWords to finish completion, or error
                countWords("https://cdn.mozilla.net/pdfjs/tracemonkey.pdf").then(function (count) {
                  alert(`Total amount of words on document: ${count}`);
                }, function (reason) {
                  console.error(reason);
                });

            
        

              /*function getSelectionCoords() {
                            var sel = document.selection, range, rect;
                            var x = 0, y = 0;
                            if (sel) {
                                if (sel.type != "Control") {
                                    range = sel.createRange();
                                    range.collapse(true);
                                    x = range.boundingLeft;
                                    y = range.boundingTop;
                                }
                            } else if (window.getSelection) {
                                sel = window.getSelection();
                                if (sel.rangeCount) {
                                    range = sel.getRangeAt(0).cloneRange();
                                    if (range.getClientRects) {
                                        range.collapse(true);
                                        if (range.getClientRects().length>0){
                                            rect = range.getClientRects()[0];
                                            x = rect.left;
                                            y = rect.top;
                                        }
                                    }
                                    // Fall back to inserting a temporary element
                                    if (x == 0 && y == 0) {
                                        var span = document.createElement("span");
                                        if (span.getClientRects) {
                                            // Ensure span has dimensions and position by
                                            // adding a zero-width space character
                                            span.appendChild( document.createTextNode("\u200b") );
                                            range.insertNode(span);
                                            rect = span.getClientRects()[0];
                                            x = rect.left;
                                            y = rect.top;
                                            var spanParent = span.parentNode;
                                            spanParent.removeChild(span);

                                            // Glue any broken text nodes back together
                                            spanParent.normalize();
                                        }
                                    }
                                }
                            }
                            return { x: x, y: y };
                            console.log(`X: ${x} Y: ${y}`);
                        };
                        getSelectionCoords();*/

            
            
            document.querySelector('#prev-page').addEventListener('click', showPrevPage);
            document.querySelector('#next-page').addEventListener('click', showNextPage);
            document.querySelector('#zoom_in').addEventListener('click', zoomIn);
            document.querySelector('#zoom_out').addEventListener('click', zoomOut);
            
            
            
            