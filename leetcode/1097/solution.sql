-- Step 3: one row per player, holding the first day the player logged in.
WITH installs AS (
    SELECT player_id, MIN(event_date) AS install_dt
    FROM Activity
    GROUP BY player_id
)
SELECT
    i.install_dt,
    -- Step 4: every installer keeps exactly one row after the LEFT JOIN.
    COUNT(*) AS installs,
    -- Step 4: a.player_id is NULL unless the player came back the next day.
    ROUND(COUNT(a.player_id) / COUNT(*), 2) AS Day1_retention
FROM installs AS i
LEFT JOIN Activity AS a
    ON a.player_id = i.player_id
   AND a.event_date = DATE_ADD(i.install_dt, INTERVAL 1 DAY)
GROUP BY i.install_dt
ORDER BY i.install_dt;
