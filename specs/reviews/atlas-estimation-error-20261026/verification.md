# Variance → Monte Carlo error-scale revision

Base3c576204; isolatedcodex/atlas-estimation-error-20261026. See [spec](../../atlas-estimation-error.md), [coursecontract](../../../montecarlo/BRIEF.md) and independentdesign-review.md. Originaldirtycheckout/LeetCode and originalCLT/samplers are untouched. Existingvariance→MonteCarloedge and20paths reused; no fabricatedmissingexperiment/newmodel.

## Actual finding and delivered teaching loop

Baseline.json reproduces oldpluginwidthcollapse atallhitsN1 and misleading95%promise; actualsamplerseed7errorincreases100→400. A knownπ-centeredrange wasnotasampleconfidenceinterval. Olddiv20SDwas valid descriptively; revisedexplicit20-sampleSDuses19withoutclaimingunbiasedSD.

Paused100/400/1600controls replayexactsamecurrentmode/seedprefix andrecordexactNendpoints. Existing20paths and actualcounts drivealloutputs. Knownp=π/4 band appears inbothmodes; frameclipdoesnotclampout-of-windowvaluesintofakeboundarytrajectories. Optionaldefinitions separate0/1samplevariance from πHatvariance andSE; N0/N1undefinednamed. RatioSE4N/SE N=.5,theobserved20SDnotexactlyhalf; no singleerror/wholetrajectory/CIguarantee. Knowntruth is onlyadiagnosticreference,pointestimate remains4hits/N.

Sourcesread: OpenStaxIntroStats2e7.1 variance/SEofthemean andNversusreplications; NIST7.2.4.1 distinguishesvalidbinomialCIconstruction/normalapproximationlimits. NoCIalgorithmornewclaimof95%coverage. Newroutevariance→montecarlo usesoriginaledge; existingvariance→gaussianZHambiguity correctedtoindividualobservationpopulationvariance. Graph38/50/14; oneCONCEPT-MAProw39corrected,notallstatisticsaudited.

## Tests and evidence

Serve repository `python3 -m http.server 18933 --bind127.0.0.1`; browsercommandsuseexistingNODE_PATH Playwright/Chrome,noinstall.

- `node --check montecarlo/app.js`,i18n.js,data.js andgitdiffcheck pass.
- `node atlas/tests/estimation-error-core.cjs`: originalPRNG/samplerbyteparity; finitebinomialenumerationN1..8independentlyverifies16p(1−p)/N,SEsquare-root; 0/1/allhit/invalidcount/samplevariancefixtures; repeated20sampleSD/19,seed7nonmonotonicerror. core.json. Notastochasticcoveragecertificate.
- `node atlas/tests/data-quality-core.cjs`,data-quality.cjs,signal-path-core.cjs,capacitor-rate-core.cjs,volt-second-core.cjs andGalaxycore pass; onlycurrentroutecountshardcodesupdatedwhere needed. Existingphysicsmodels/sourceappunchanged.
- `NODE_PATH=<existing modules> node atlas/tests/estimation-error-browser.cjs`: actualCLTuniform/runall→Back→MC2,20existingseedoutputsfor100/400/1600exactand100replay; visiblecanvasimagesdifferwithNandreturnidentically; mode/baseSeed/pause/aria; sampledefinitions/locale/fold/reset/newseed/play→snapshotstop/refresh; EN/ZH390,320actual200%text,48px/3pxkeyboard/forcedcolors/reducedmotion,Back/Atlasstation. browser/browser.json/screenshots pass,no pageerrors. Rootvisuallyinspected100/400images. TestdriverwascorrectedtoensurefoldopenandfreshindependentlocaleDOM,insteadofclosingrestoredfold/doublingalreadydoubledstyles; notaproductbug.
- ExistingAtlasbrowser navigation/search/filter/routeandGalaxyreal-graphlayout regression pass; atlas-browser.log/atlas-regression andgalaxy-core.json. No unrelatedfullsite/oldphysicsbrowsersuites rerun.
- Independentscientific/codeprobe: estimation-error-review-20261026.*,zero mustfix. Confirms original20seedparity,currentmodecheckpointreplay,rawsample/estimvar/SEandnoCIsemantics. NoChromeclaim.
- IndependentUI-firstEN/ZH390trial,cold-review/review.md,zero mustfix: Nvs20,varianceobjects,knowntruthnonCI,pauses/replay/reset/locale/key/actualBackunderstoodbyAIreader. Notrealhumanlearningevidence.

## Delivery limits / next handoff

MainSHA/sourceeditions/productionrelease are separatelyboundatdeliverytime; thisimplementationrecordalone doesnotclaimpublication. ProductionMC4filespluslesson-shell.cssfreshadminhashesmatchedmain3c576204beforepackaging; preserveifdriftlater. KnownpublicCloudflare403/error1010:notretried/alternateclient/securitychange. Server-localHTTP/hashcheckisnotpublicbrowseracceptance. No physicalphone/Safari/speech,humancomprehensionorformalPRNGindependenceclaim. OtherlegacyMC/CLTtext/modelsarenotnewlycertified.

Nextcandidate: observe whetheruserscanexplainNversusreplicationsanduncertaintyfromthisloop; onlytheninspectoneactualBayes/measurementgap ratherthanmechanicallyaddingnodes. PublicaccessneedsownerCloudflareeventinspection,separatefromknowledgecontent.
