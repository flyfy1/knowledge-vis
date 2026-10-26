# Official verification — author capture

Accessed 2026-10-26T08:19:01.297082+00:00

Official URL: https://leetcode.com/problems/shortest-common-supersequence/

Public GET https://leetcode.com/graphql/ with query:

```graphql
query { question(titleSlug: "shortest-common-supersequence") { questionId title content codeSnippets { lang langSlug code } } }
```

HTTP 200; full raw response in official-graphql.json. Internal questionId is 1170; displayed frontend ID is 1092. Normal page via requests returned 403; public GraphQL succeeded without authentication.

<p>Given two strings <code>str1</code> and <code>str2</code>, return <em>the shortest string that has both </em><code>str1</code><em> and </em><code>str2</code><em> as <strong>subsequences</strong></em>. If there are multiple valid strings, return <strong>any</strong> of them.</p>

<p>A string <code>s</code> is a <strong>subsequence</strong> of string <code>t</code> if deleting some number of characters from <code>t</code> (possibly <code>0</code>) results in the string <code>s</code>.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<pre>
<strong>Input:</strong> str1 = &quot;abac&quot;, str2 = &quot;cab&quot;
<strong>Output:</strong> &quot;cabac&quot;
<strong>Explanation:</strong> 
str1 = &quot;abac&quot; is a subsequence of &quot;cabac&quot; because we can delete the first &quot;c&quot;.
str2 = &quot;cab&quot; is a subsequence of &quot;cabac&quot; because we can delete the last &quot;ac&quot;.
The answer provided is the shortest such string that satisfies these properties.
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> str1 = &quot;aaaaaaaa&quot;, str2 = &quot;aaaaaaaa&quot;
<strong>Output:</strong> &quot;aaaaaaaa&quot;
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>1 &lt;= str1.length, str2.length &lt;= 1000</code></li>
	<li><code>str1</code> and <code>str2</code> consist of lowercase English letters.</li>
</ul>


## Observed submission selectors and interfaces

### C++ (cpp)
```
class Solution {
public:
    string shortestCommonSupersequence(string str1, string str2) {
        
    }
};
```

### Java (java)
```
class Solution {
    public String shortestCommonSupersequence(String str1, String str2) {
        
    }
}
```

### Python3 (python3)
```
class Solution:
    def shortestCommonSupersequence(self, str1: str, str2: str) -> str:
        
```

### Python (python)
```
class Solution(object):
    def shortestCommonSupersequence(self, str1, str2):
        """
        :type str1: str
        :type str2: str
        :rtype: str
        """
        
```

### JavaScript (javascript)
```
/**
 * @param {string} str1
 * @param {string} str2
 * @return {string}
 */
var shortestCommonSupersequence = function(str1, str2) {
    
};
```

### TypeScript (typescript)
```
function shortestCommonSupersequence(str1: string, str2: string): string {
    
};
```

### C# (csharp)
```
public class Solution {
    public string ShortestCommonSupersequence(string str1, string str2) {
        
    }
}
```

### C (c)
```
char* shortestCommonSupersequence(char* str1, char* str2) {
    
}
```

### Go (golang)
```
func shortestCommonSupersequence(str1 string, str2 string) string {
    
}
```

### Kotlin (kotlin)
```
class Solution {
    fun shortestCommonSupersequence(str1: String, str2: String): String {
        
    }
}
```

### Swift (swift)
```
class Solution {
    func shortestCommonSupersequence(_ str1: String, _ str2: String) -> String {
        
    }
}
```

### Rust (rust)
```
impl Solution {
    pub fn shortest_common_supersequence(str1: String, str2: String) -> String {
        
    }
}
```

### Ruby (ruby)
```
# @param {String} str1
# @param {String} str2
# @return {String}
def shortest_common_supersequence(str1, str2)
    
end
```

### PHP (php)
```
class Solution {

    /**
     * @param String $str1
     * @param String $str2
     * @return String
     */
    function shortestCommonSupersequence($str1, $str2) {
        
    }
}
```

### Dart (dart)
```
class Solution {
  String shortestCommonSupersequence(String str1, String str2) {
    
  }
}
```

### Scala (scala)
```
object Solution {
    def shortestCommonSupersequence(str1: String, str2: String): String = {
        
    }
}
```

### Elixir (elixir)
```
defmodule Solution do
  @spec shortest_common_supersequence(str1 :: String.t, str2 :: String.t) :: String.t
  def shortest_common_supersequence(str1, str2) do
    
  end
end
```

### Erlang (erlang)
```
-spec shortest_common_supersequence(Str1 :: unicode:unicode_binary(), Str2 :: unicode:unicode_binary()) -> unicode:unicode_binary().
shortest_common_supersequence(Str1, Str2) ->
  .
```

### Racket (racket)
```
(define/contract (shortest-common-supersequence str1 str2)
  (-> string? string? string?)
  )
```