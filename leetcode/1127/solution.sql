WITH user_day AS (
    -- (a) One row per (date, user): a user who used both platforms that day becomes 'both'.
    SELECT
        spend_date,
        user_id,
        CASE
            WHEN COUNT(DISTINCT platform) = 2 THEN 'both'
            ELSE MAX(platform)
        END AS platform,
        SUM(amount) AS amount
    FROM Spending
    GROUP BY spend_date, user_id
),
grid AS (
    -- (b) Fixed output shape: every date in Spending gets all three rows, even empty ones.
    SELECT DISTINCT s.spend_date, p.platform
    FROM Spending AS s
    CROSS JOIN (
        SELECT 'desktop' AS platform
        UNION ALL SELECT 'mobile'
        UNION ALL SELECT 'both'
    ) AS p
)
SELECT
    g.spend_date,
    g.platform,
    COALESCE(SUM(u.amount), 0) AS total_amount,
    COUNT(u.user_id) AS total_users
FROM grid AS g
LEFT JOIN user_day AS u
    ON u.spend_date = g.spend_date
   AND u.platform = g.platform
GROUP BY g.spend_date, g.platform
ORDER BY
    g.spend_date,
    CASE g.platform WHEN 'desktop' THEN 1 WHEN 'mobile' THEN 2 ELSE 3 END;
