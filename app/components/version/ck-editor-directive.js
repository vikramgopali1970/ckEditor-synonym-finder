    "use strict";

    angular.module('myApp.version.ck-editor', [])
        .directive('ngCkeditor', function ($http) {
            return {
                restrict: 'E',
                scope: {
                    ngModel: '=ngModel',
                    ngChange: '=ngChange',
                    ngDisabled: '=ngDisabled',
                    ngConfig: '=ngConfig',
                    synRes: '=synRes'
                },
                link: function (scope, elem, attrs) {


                    CKEDITOR.plugins.add( 'synonym', {
                        init: function( editor ) {

                            editor.addCommand( 'synonym', new CKEDITOR.dialogCommand( 'synonymDialog' ) );

                            editor.ui.addButton( 'synonym', {
                                label: 'Find Synonym',
                                command: 'synonym',
                                toolbar: 'insert',
                                icon : 'https://image.flaticon.com/icons/svg/511/511139.svg'
                            });
                        }
                    });

                    CKEDITOR.on('instanceCreated', function (event) {
                        var editor = event.editor,
                            element = editor.element;

                        CKEDITOR.dialog.add( 'synonymDialog', function( editor ) {
                            return {
                                title: 'Find Synonym',
                                minWidth: 300,
                                minHeight: 100,

                                contents: [
                                    {
                                        id: 'get-input',
                                        label: 'Basic Settings',
                                        elements: [
                                            {
                                                type: 'html',
                                                html: '<p> Please enter the word for which you are looking for synnonyms </p>'
                                            },
                                            {
                                                type: 'text',
                                                id: 'syn-word-inp',
                                                'default': ''
                                            }
                                        ]
                                    }
                                ],
                                buttons: [ CKEDITOR.dialog.okButton, CKEDITOR.dialog.cancelButton ],
                                onOk: function(event) {

                                    var elem = this.getContentElement('get-input','syn-word-inp');
                                    $http.get("http://api.datamuse.com/words?rel_syn="+elem.getValue()+"&max=10").then(result=>{
                                        scope.synRes = result.data;
                                        if(result.data.length !== 0){
                                            setTimeout(()=>{
                                                document.getElementById("syn_res").click();
                                            },100)
                                        }else{
                                            alert("The field cannot be empty");
                                            event.data.hide = false;
                                        }
                                    }).catch(error=>{
                                        console.log("there was error while finding the synonym due to broken API ");
                                        alert("DataMuse Server is not Working, Please Try after some time");
                                    })



                                }
                            };
                        });


                        if (element.getAttribute('class') == 'simpleEditor') {
                            editor.on('configLoaded', function () {
                                editor.config.removePlugins = 'colorbutton,find,flash,font, forms,iframe,image,newpage,removeformat, smiley,specialchar,stylescombo,templates';
                                editor.removeButtons = 'About';
                                editor.config.toolbarGroups = [{
                                    name: 'editing',
                                    groups: ['basicstyles', 'links']
                                }, {
                                    name: 'undo'
                                }, {
                                    name: 'clipboard',
                                    groups: ['selection', 'clipboard']
                                }];
                            });
                        }
                    });

                    elem[0].innerHTML = '<div class="ng-ckeditor"></div> <div class="totalTypedCharacters"></div>';

                    var elemEditor = elem[0].querySelectorAll('.ng-ckeditor');
                    var config = {
                        removeButtons: (attrs.removeButtons != undefined) ? 'About,' + attrs.removeButtons : 'About',
                        readOnly: scope.ngDisabled ? scope.ngDisabled : false
                    };

                    config.extraPlugins = 'synonym';
                    var editor = CKEDITOR.appendTo(elemEditor[0], (scope.ngConfig ? scope.ngConfig : config), '');

                    var addEventListener = function (editor) {
                        (editor).on('change', function (evt) {
                            scope.$apply(function () {
                                scope.ngModel = evt.editor.getData();
                            });
                            if (attrs.msnCount != undefined) {
                                element[0].querySelector('.totalTypedCharacters').innerHTML = attrs.msnCount + " " + evt.editor.getData().length;
                            }
                            if(scope.ngChange && typeof scope.ngChange === 'function'){
                                scope.ngChange(evt.editor.getData());
                            }
                        });
                        (editor).on('focus', function (evt) {
                            editor.setData(scope.ngModel);
                        });
                    };

                    var interval = undefined;
                    var setValue = function (value, editor) {
                        if (interval) {
                            clearTimeout(interval);
                        }
                        interval = setTimeout(function () {
                            if (value && editor) {
                                editor.setData(value);
                            } else if (editor) {
                                editor.setData('');
                            }
                        }, 1000);
                    };

                    addEventListener(editor);

                    scope.$watch('ngModel', function (value) {
                        if(value !== editor.getData()){
                            setValue(value, editor);
                        }
                    });

                    scope.$watch('ngDisabled', function (value) {
                        if (value) {
                            config.readOnly = true;
                        } else {
                            config.readOnly = false;
                        }

                        editor.destroy();
                        editor = CKEDITOR.appendTo(elemEditor[0], (scope.ngConfig ? scope.ngConfig : config), '');
                        addEventListener(editor);
                        editor.setData(scope.ngModel);

                    });

                }
            };
        });
