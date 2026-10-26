# Variance → Monte Carlo estimation error

Read WORKFLOW, montecarlo/BRIEF.md and provenance spec. [Independent gate](reviews/atlas-estimation-error-20261026/design-review.md).

## Actual gap and bounded loop

Base3c576204 already has variance→MonteCarlo relation and20seedtrajectories. Do not addduplicate models/edges orclaim experimentmissing. Actualmisleading Step2 text says lockstepshrinking/correctdecimalpurchase and2σpromises95%confidence, while the band is centered on knownπ with sample-dependentwidth. Old20-valueSD divided20 is a legitimate descriptiveSD but unlabeled; thisrevision explicitly chooses sampleSD/19.

P0: reuse exact seedstreams and currentmodes/play/reset. Add paused checkpointsN100/400/1600,with samebaseSeed and exacttrajectoryendpoints,not newindependentruns whenNchanges. Compare visible20trajectories/endpointspread and currentSE. Optional definitions separate raw0/1data from estimate distribution. Existing variance→montecarlo route,sourceclaims and scientificcopy repaired. P1 focusedacceptance; deferred newCImethods,CLTchanges,allstatistics expansion,newstores/services.

## Model and source→claim

Xi=1forinside,0otherwise; ideal iiduniformpoints givep=π/4,Var(X)=p(1−p). πHat=4mean(X),Var(πHat)=16p(1−p)/N andSE=4sqrt(p(1−p)/N). This is exact variance scaling under those assumptions; noCLT needed forvariance identity. Normalshape/approximatecoverage additionally needappropriateconditions. Ncounts points within ONE estimate;20counts displayed replications. PRNGstreams illustrate the idealiidmodel,notprove independence.

The firstcurrentrun's observed samplevariance sX²=N/(N−1)pHat(1−pHat) exists onlyN≥2. It describes0/1observations,not estimatorvariance.20πestimates produce sampleSD=sqrt(sum(pi−mean)²/19); this is a noisy estimate of the single-estimatorSE scale,notSEofthemeanof20 andnotanunbiasedSDclaim. N0estimate/SEundefined; samplevarundefinedN<2; allhitobservedsamplevar0can coexistwithpositiveknownmodelSE. Pure helpers validatecounts/finitearrays; originalPRNG/pointinclusionunchanged.

Knowntruthbenchmark π±2SE usesknownp,notpluginpHat; it is not a sample-centeredconfidenceinterval for unknownπ or an all-Ncoverage tube. The page deliberately usesknownπ tocheckthealgorithm,notcalculateits pointestimate. No guaranteed95%coverage/exactdecimalclaim. [OpenStax7.1](https://openstax.org/books/introductory-statistics-2e/pages/7-1-the-central-limit-theorem-for-sample-means-averages) supplies variance/SEofmean and distinguishesNfromreplications. [NISTconfidenceintervals](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm) supplies realbinomialCIconstruction/normalapproximationlimits; we doNOT implementWilson/exactCI orcallthereferencebandone. Sources read; no sourceparagraphs copied.

## Interaction and recovery

Checkpoint preservesmode/baseSeed,pauses,explicitly replays its existingprefix and snapshotsNexactly. 100→400usesnestedprefixes; the comparisons acrossNarenotindependentreplications. Modecontrols andsnapshotbuttons deriveactive/aria-pressed state fromexistingdata. Resetemptiesreadouts/trajectoriesandstops; newSeedchangesbaseSeedexplicitly; localeflip preservesN/seed/mode/data/fold, andkeyboardfocusremainsstable. No newstate/store/clock/model. Existing animate scheduler andtargets remain.

OnlyStep2 band and relatedcopy/statistics arechanged; draw knownreference inbothmodes. Fixed plotwindow2.62..3.66isdisplayextent; clippaths ratherthanclampingoutofrangevalues ontoedge,readoutsunclipped. Shortsymbolcanvaslegend plus wrappedDOMlegend explainscolors/reference. Nativeoptionaldefinitionfold,originaltokens,48pxtargets/3pxfocus/320actual200%ENZH/forcedcolors/reducedmotion. Purefunctions and existingMCtestinterface expose read-onlystatistics/state,not hiddennewcontrols.

Graph38nodes/50relations/14routes,no newnode/edge. Existingvariance→gaussian wording nowexplicitlysingle-observationpopulationvariance ratherthan ambiguous“samplevarianceσ²”. ExistingMCsourceandrelationstay; two-stationuncertaintyroute usesfiniteuniformCLT3 thenMC2,with distinctexamples/noparametertransfer. OneCONCEPT-MAP row39 no longerguaranteestube/decimalaccuracy.

## Recurrence acceptance

- Actualseed7:|error100|≈.018407→|error400|≈.021593,morepoints canworsenindividualerror. TheorySE400/SE100=.5 andSE1600/SE400=.5;20sampleSD neednotexactlyhalforbe monotonic. Sampleroutputsbyte/seed parity retained.
- PureBernoulli/samplevariancefixtures n0/n1/allhit/nonehit/invalidcounts/nonfinitevalues; explicitfactor16and√,nversus20distinction. Independent20-runmean/variancecalculation,exactcheckpointNandprefixrepeat100→400→100.
- Actualnewcontrols changevisibletrajectories/readouts; bothmodes,bothlanguages,seed/reset/play/pause/locale/Back/refresh,48px/focus/320/200%text,sourceanchors. No claimtruephone/speech or humanlearningeffect.
- ExistinggraphandaffectedAtlasregression; unrelatedphysics/LeetCode untouched. Static truthfulCodexsourceinventory22records onlyafteracceptedimplementationbinding. OriginalMCunknowncontributors retained. Main/push/originrelease separatefrompublicchecks; respectexistingCloudflare403/1010withoutretry/bypass/securitychange.
