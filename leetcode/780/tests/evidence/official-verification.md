# Official verification

Accessed 2026-10-25T11:17:13.212664+00:00

Official URL: https://leetcode.com/problems/reaching-points/

Direct GET returned 403 (official-page.html). Public POST https://leetcode.com/graphql/ returned 200. Query: question(titleSlug: "reaching-points") { questionId questionFrontendId title titleSlug isPaidOnly difficulty content exampleTestcases codeSnippets { lang langSlug code } }. Full unmodified JSON: official-graphql.json.

Observed selector/interface snippets:

C++
```
class Solution {
public:
    bool reachingPoints(int sx, int sy, int tx, int ty) {
        
    }
};
```

Java
```
class Solution {
    public boolean reachingPoints(int sx, int sy, int tx, int ty) {
        
    }
}
```

Python3
```
class Solution:
    def reachingPoints(self, sx: int, sy: int, tx: int, ty: int) -> bool:
        
```

Python
```
class Solution(object):
    def reachingPoints(self, sx, sy, tx, ty):
        """
        :type sx: int
        :type sy: int
        :type tx: int
        :type ty: int
        :rtype: bool
        """
        
```

JavaScript
```
/**
 * @param {number} sx
 * @param {number} sy
 * @param {number} tx
 * @param {number} ty
 * @return {boolean}
 */
var reachingPoints = function(sx, sy, tx, ty) {
    
};
```

TypeScript
```
function reachingPoints(sx: number, sy: number, tx: number, ty: number): boolean {
    
};
```

C#
```
public class Solution {
    public bool ReachingPoints(int sx, int sy, int tx, int ty) {
        
    }
}
```

C
```
bool reachingPoints(int sx, int sy, int tx, int ty) {
    
}
```

Go
```
func reachingPoints(sx int, sy int, tx int, ty int) bool {
    
}
```

Kotlin
```
class Solution {
    fun reachingPoints(sx: Int, sy: Int, tx: Int, ty: Int): Boolean {
        
    }
}
```

Swift
```
class Solution {
    func reachingPoints(_ sx: Int, _ sy: Int, _ tx: Int, _ ty: Int) -> Bool {
        
    }
}
```

Rust
```
impl Solution {
    pub fn reaching_points(sx: i32, sy: i32, tx: i32, ty: i32) -> bool {
        
    }
}
```

Ruby
```
# @param {Integer} sx
# @param {Integer} sy
# @param {Integer} tx
# @param {Integer} ty
# @return {Boolean}
def reaching_points(sx, sy, tx, ty)
    
end
```

PHP
```
class Solution {

    /**
     * @param Integer $sx
     * @param Integer $sy
     * @param Integer $tx
     * @param Integer $ty
     * @return Boolean
     */
    function reachingPoints($sx, $sy, $tx, $ty) {
        
    }
}
```

Dart
```
class Solution {
  bool reachingPoints(int sx, int sy, int tx, int ty) {
    
  }
}
```

Scala
```
object Solution {
    def reachingPoints(sx: Int, sy: Int, tx: Int, ty: Int): Boolean = {
        
    }
}
```

Elixir
```
defmodule Solution do
  @spec reaching_points(sx :: integer, sy :: integer, tx :: integer, ty :: integer) :: boolean
  def reaching_points(sx, sy, tx, ty) do
    
  end
end
```

Erlang
```
-spec reaching_points(Sx :: integer(), Sy :: integer(), Tx :: integer(), Ty :: integer()) -> boolean().
reaching_points(Sx, Sy, Tx, Ty) ->
  .
```

Racket
```
(define/contract (reaching-points sx sy tx ty)
  (-> exact-integer? exact-integer? exact-integer? exact-integer? boolean?)
  )
```

Statement constraints: all four coordinates are integers from 1 to 10^9. No nonpositive inputs; zero moves explicitly supported by example 3.
