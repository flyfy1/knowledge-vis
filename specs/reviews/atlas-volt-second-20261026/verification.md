# Integral → inductor → Buck: bounded acceptance

Baseede2ef1d; isolatedcodex/atlas-volt-second-20261026. Actual gap recorded before implementation: text balance and current existed, signedvoltagearea and graphintegral→inductor relation did not. See baseline.json, [contract](../../atlas-volt-second.md), independentdesign-review.md. This is one3-station loop; no newconcepts/physicsstate, no whole-site acceptance.

## Accepted behavior and scientific evidence

Buck's existing derive disclosure gains exact-clipped vL rectangles up to the SAME seektime, signedVs→Δi and original nonzeroinitial/current readouts. ON-end/oneperiod presets use the originalseek input andpause; DOMbuttons/focusstaystable. At12V/D.5:ONend+150Vµs→+.15A; fullperiodnet0,i.925A. D75at50µs changes rectangle heights/widths andareas±112.5Vµs,net0. Shows voltagearea≠energy and currentchange≠current, signedcontribution≠accumulatednet. This is the pre-existing steadyCCM model, not startup/convergence.

Sources were actually read: AnalogDevices BuckConverterBasics ideal-current-slope andvoltsecondsections; OpenStax14.2 inducedemf requires differentpolarity than terminalvL; TIcurrentURLredirects revisionC and includesnonideal efficiency, which was not imported. No textbook images/prose copied. One newapplicationedge/route;38/50/13, no inferred prerequisite. Velocityv inintegralexample andvoltagevL are explicitlydifferent, as are10mH/.5ms pulse and1mH/50µs Buck examples.

## Verification evidence / reproduction

Serve repository onloopback18931. Existing Node/Playwright/Chrome only, no installs.

- Syntax app.js/voltage-area.js/data.js and gitdiffcheck pass.
- `node atlas/tests/volt-second-core.cjs`: analyticrectangle sum versus independent midpointquadrature split at originalmodel boundaries and originalm.sample currentdifference across grid/random/boundary/invalidtime cases; maxcurrent residual2.64e−16A. core.json. Originalmodel.js/flow.js/Atlasapp bytechecks pass.
- `node atlas/tests/data-quality.cjs` anddata-quality-core.cjs: endpoints/bilingualtasks/sourcepaths/explicitprerequisite semantics pass. data-quality.json.
- Existingcapacitor-rate-core,signal-path-core,power-converters/tests/model.cjs,Galaxytests/core.cjs pass; only hardcodedcurrentgraphcounts updated. No physicalmodel/modelparameters changed.
- `NODE_PATH=<existing modules> node atlas/tests/volt-second-browser.cjs`: actual3course actions, BuckONboundary/fullperiod, same-timeDchange, visiblearea geometry, nonzerooffset, stablepresets, playback/quietliveannouncements/presetpause, Back/refresh/locale,EN/ZH390/320true200%text/48px/3pxfocus/forcedcolors/reduced. browser/browser.json and screenshots pass with no pageerrors. Rootinspected actual screenshots; independentcoldreview also inspected sign/shape differences.
- Finaldisplayfixprobe display-repair.json: initialclosed-disclosure sizing uses visibletrace fallback so firstopen/afterpreset viewBoxsame; Vin5/D75 symmetricdecimal46.88/−46.88, nearzero suppresses−0.00 while rawarea retained. Regresstest driver corrected its own assumptions: ensurefoldopen rather thanblindtoggle; explicitlysetVin12/D50 before eachindependentlocale fixture. Those were not productfailures.
- Existingflow-lifecycle.cjs,capacitor-rate-browser.cjs andAtlasbrowser.cjs runserially; logs andJSONsubfolders record finalresult. Review the files for pass; no whole-site/past-expensive suites repeated.
- Independent scientific/codeprobe/shortreport: volt-second-review-20261026.*, zero mustfix. Its16uniformquadrature cases have a stated finite-discretization error bound; do not call those residuals ouranalyticerror. Rootsplit-quadrature is the separateexact-interval check above.
- UI-first390EN/ZH coldwalk withoutsource/specfirst: cold-review/review.md, zero mustfix. DefaultON/period,D75,reset,currentoffset,keyboardpresets,actualBack verified. This is anAI reviewer, not human learning-effect evidence.

## Publication / handoff limits

Implementation/provenance commits and finalmain/originrelease are reported separately at delivery time; this record alone is not proof of deployment. PriorpublicCloudflare403/error1010 remains a restriction: no repeatedpublicrequests,alternateclients orsecuritychanges in this batch. Originhash/HTTP checks must be labelledserver-local, not publicbrowserpass. No actualphone/Safari/speech/hardware or measuredlearningoutcome claim. Newdocument reload resets originalseek; Back preservesAtlasstation ratherthan cross-courseparametertransfer.

Next candidate: leave circuit expansion bounded; inspect an actual math→measurement learning gap before selecting more graphcontent. Public access requires siteowner Cloudflareevent inspection, not a bypass.
