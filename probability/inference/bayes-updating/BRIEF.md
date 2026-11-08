# Bayes — neutral measurement direction revision

Currentincrementalcontract:[atlas-bayes-measurement](../specs/atlas-bayes-measurement.md),WORKFLOWandprovenancepolicy. Noacceptanceclaimforalloriginalmedical/Betaexamples.

Known: a cardmayhaveastar; readerlampscanlightforbothmarked/unmarkedcards. Uniquequestion:isP(lamp|star)theprobabilityofstarafterlamp? Inputs: originalS1priorp,readonly.90/.09rates; controls: originalsliderplus1%/10%presets. Observeexistingprior/posteriorbarsandE-onlycompositionmove,whilemeasurementlikelihoodsremainfixed. Predicttheposteriorafterpriorincreases; 1%→9.17%,10%→52.63%. Conditions: toyone-readingprobabilitymodel,priorbeforeevidence,notrealdevicecalibration.

Termsfirstuse:H=markedcard,E=lamp; prior=P(H),likelihoods=P(E|H)/P(E|¬H),posterior=P(H|E). WholepopulationjointmassesA/Bversus100%-E-poolshareexplicit; notfractionalobservedcardcounts. Originalprobabilitycore/freqCounts/state/otherstepsunchanged.1%presetrestoresdefault; no newprofile/store/clock. Graphintroopens#step1; original#step2oddsremainsadvancedcontinuation. Everyrepairmustupdatethiscontractandspec,evidencealoneinsufficient.

AcceptedS1implementationsource:ce20ae377c52ab8e81629283f31ec3ea84a3e94f. One staticCodexrevisedheader/inventoryrecord; originale9774b0acourse/mathfunctionsretained,otherchaptersnotnewlycertified.

## S3 evidence identity correction — 2026-10-26

Current scoped contract: [new measurement versus duplicate record](../specs/atlas-bayes-evidence-identity.md). The S1-only historical boundary above is superseded solely for this S3 repair; S2/S4–S6 and probability/Beta/PRNG core remain unchanged.

Known: same neutral star card and .90/.09 reader likelihoods. Question: does copying R1 add information? Fixed1% prior; not inherited from S1. New-reading buttons explicitly assume conditional independence given H AND given ¬H. Copy-last duplicates the known record, effective LR1; curve, odds and chips use one validated effective-LR helper. Predict R1→copy plateau versus R1→newR2 rise; Undo/clear reuse the ledger, no new store/model/clock. Terms: record identity versus measurement, conditional independence versus population independence, odds factor. Optional constructed joint table disproves the old erroneous general upper-bound claim; new dependent observations can add information with a valid conditional model. Full source, recurrence criteria and limits are in the scoped spec.

Accepted S3 implementation source: 51f098fdd5a7d733901823008af03eebfe89c639. Revised-edition inventory/header now encompass the prior S1 work and this bounded correction, without reattributing original authorship.
