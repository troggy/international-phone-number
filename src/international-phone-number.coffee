# Author Marek Pietrucha
# https://github.com/mareczek/international-phone-number

"use strict"
angular.module("internationalPhoneNumber", [])

.constant 'ipnConfig', {
    allowExtensions:        false
    autoFormat:             true
    autoHideDialCode:       true
    autoPlaceholder:        true
    customPlaceholder:      null
    initialCountry:         ""
    geoIpLookup:            null
    nationalMode:           true
    numberType:             "MOBILE"
    onlyCountries:          undefined
    preferredCountries:     ['us', 'gb']
    skipUtilScriptDownload: false
    utilsScript:            ""
  }

.directive 'internationalPhoneNumber', ['$timeout', 'ipnConfig', ($timeout, ipnConfig) ->

  restrict:   'A'
  require: '^ngModel'
  scope:
    ngModel: '='
    country: '='
    geoIpLookup: '&'

  link: (scope, element, attrs, ctrl) ->

    if ctrl
      if element.val() != ''
        $timeout () ->
          element.intlTelInput 'setNumber', element.val()
          ctrl.$setViewValue element.val()
        , 0


    read = () ->
      ctrl.$setViewValue element.val()

    handleWhatsSupposedToBeAnArray = (value) ->
      if value instanceof Array
        value
      else
        value.toString().replace(/[ ]/g, '').split(',')

    options = angular.copy(ipnConfig)

    angular.forEach options, (value, key) ->
      return unless attrs.hasOwnProperty(key) and angular.isDefined(attrs[key])
      option = attrs[key]
      if key == 'preferredCountries'
        options.preferredCountries = handleWhatsSupposedToBeAnArray option
      else if key == 'onlyCountries'
        options.onlyCountries = handleWhatsSupposedToBeAnArray option
      else if typeof(value) == "boolean"
        options[key] = (option == "true")
      else
        options[key] = option
    options['geoIpLookup'] = if scope.geoIpLookup then scope.geoIpLookup() else null
    # Wait for ngModel to be set
    watchOnce = scope.$watch('ngModel', (newValue) ->
      # Wait to see if other scope variables were set at the same time
      scope.$$postDigest ->

        if newValue != null && newValue != undefined && newValue.length > 0

          if newValue[0] != '+'
            newValue = '+' + newValue

          ctrl.$modelValue = newValue

        element.intlTelInput(options)

        unless options.skipUtilScriptDownload || attrs.skipUtilScriptDownload != undefined || options.utilsScript
          element.intlTelInput('loadUtils', '/bower_components/intl-tel-input/lib/libphonenumber/build/utils.js')

        watchOnce()

    )

    scope.$watch('country', (newValue) ->
        if newValue != null && newValue != undefined && newValue != ''
            element.intlTelInput("setCountry", newValue)
    )

    ctrl.$formatters.push (value) ->
      if value
        if value.charAt(0) != '+'
          value = '+' + value

        element.intlTelInput 'setNumber', value
        
      value

    ctrl.$parsers.push (value) ->
      if !value
        return value

      element.intlTelInput('getNumber').replace(/[^\d]/g, '')

    ctrl.$validators.internationalPhoneNumber = (value) ->
      selectedCountry = element.intlTelInput('getSelectedCountryData')

      if !value || (selectedCountry && selectedCountry.dialCode == value)
        return true

      element.intlTelInput("isValidNumber")

    element.on 'blur keyup change', (event) ->
      scope.$apply read

    element.on '$destroy', () ->
      element.intlTelInput('destroy');
      element.off 'blur keyup change'
]
