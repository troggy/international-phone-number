(function() {
  "use strict";
  angular.module("internationalPhoneNumber", []).constant('ipnConfig', {
    allowExtensions: false,
    autoFormat: true,
    autoHideDialCode: true,
    autoPlaceholder: true,
    customPlaceholder: null,
    initialCountry: "",
    geoIpLookup: null,
    nationalMode: true,
    numberType: "MOBILE",
    onlyCountries: void 0,
    preferredCountries: ['us', 'gb'],
    skipUtilScriptDownload: false,
    utilsScript: ""
  }).directive('internationalPhoneNumber', [
    '$timeout', 'ipnConfig', function($timeout, ipnConfig) {
      return {
        restrict: 'A',
        require: '^ngModel',
        scope: {
          ngModel: '=',
          country: '=',
          geoIpLookup: '&'
        },
        link: function(scope, element, attrs, ctrl) {
          var checkReadOnly, handleWhatsSupposedToBeAnArray, options, read, watchOnce;
          if (ctrl) {
            if (element.val() !== '') {
              $timeout(function() {
                element.intlTelInput('setNumber', element.val());
                return ctrl.$setViewValue(element.val());
              }, 0);
            }
          }
          read = function() {
            return ctrl.$setViewValue(element.val());
          };
          handleWhatsSupposedToBeAnArray = function(value) {
            if (value instanceof Array) {
              return value;
            } else {
              return value.toString().replace(/[ ]/g, '').split(',');
            }
          };
          checkReadOnly = function() {
            var divIntlTelInput, readOnly, readOnlyClass, readOnlySpan;
            readOnly = attrs.readonly;
            if (readOnly) {
              readOnlyClass = 'intl-tel-input-read-only';
              divIntlTelInput = element.parents('.intl-tel-input:first');
              divIntlTelInput.find('select:first').attr('disabled', true);
              divIntlTelInput.find('.iti-arrow').hide();
              readOnlySpan = divIntlTelInput.find('span.' + readOnlyClass);
              if (readOnlySpan.length === 0 && element.val() !== '') {
                readOnlySpan = angular.element('<span></span>');
                readOnlySpan.attr('class', readOnlyClass);
                readOnlySpan.attr('style', 'padding-left: 38px');
                element.hide();
                element.after(readOnlySpan);
              }
              readOnlySpan.text(element.val());
            }
          };
          options = angular.copy(ipnConfig);
          angular.forEach(options, function(value, key) {
            var option;
            if (!(attrs.hasOwnProperty(key) && angular.isDefined(attrs[key]))) {
              return;
            }
            option = attrs[key];
            if (key === 'preferredCountries') {
              return options.preferredCountries = handleWhatsSupposedToBeAnArray(option);
            } else if (key === 'onlyCountries') {
              return options.onlyCountries = handleWhatsSupposedToBeAnArray(option);
            } else if (typeof value === "boolean") {
              return options[key] = option === "true";
            } else {
              return options[key] = option;
            }
          });
          options['geoIpLookup'] = scope.geoIpLookup ? scope.geoIpLookup() : null;
          watchOnce = scope.$watch('ngModel', function(newValue) {
            return scope.$$postDigest(function() {
              if (newValue !== null && newValue !== void 0 && newValue.length > 0) {
                if (newValue[0] !== '+') {
                  newValue = '+' + newValue;
                }
                ctrl.$modelValue = newValue;
              }
              element.intlTelInput(options);
              if (!(options.skipUtilScriptDownload || attrs.skipUtilScriptDownload !== void 0 || options.utilsScript)) {
                element.intlTelInput('loadUtils', '/bower_components/intl-tel-input/lib/libphonenumber/build/utils.js');
              }
              return watchOnce();
            });
          });
          scope.$watch('country', function(newValue) {
            if (newValue !== null && newValue !== void 0 && newValue !== '') {
              return element.intlTelInput("setCountry", newValue);
            }
          });
          ctrl.$formatters.push(function(value) {
            if (!value) {
              return value;
            }
            element.intlTelInput('setNumber', value);
            checkReadOnly();
            return element.val();
          });
          ctrl.$parsers.push(function(value) {
            if (!value) {
              return value;
            }
            return value.replace(/[^\d]/g, '');
          });
          ctrl.$validators.internationalPhoneNumber = function(value) {
            var selectedCountry;
            selectedCountry = element.intlTelInput('getSelectedCountryData');
            if (!value || (selectedCountry && selectedCountry.dialCode === value)) {
              return true;
            }
            return element.intlTelInput("isValidNumber");
          };
          element.on('blur keyup change', function(event) {
            return scope.$apply(read);
          });
          return element.on('$destroy', function() {
            element.intlTelInput('destroy');
            return element.off('blur keyup change');
          });
        }
      };
    }
  ]);

}).call(this);
