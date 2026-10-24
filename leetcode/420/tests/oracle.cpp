// Independent edit-distance DP to the finite-state language of strong strings.
// No run-length division or greedy deletion priorities are used.
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int oracle(string s) {
 string alphabet=s+"abAB01.!";sort(alphabet.begin(),alphabet.end());alphabet.erase(unique(alphabet.begin(),alphabet.end()),alphabet.end());
 int A=alphabet.size(),S=(A+1)*3*8,INF=999;
 auto idx=[](int c,int r,int m){return (c*3+r)*8+m;};
 vector<vector<int>> cur(21,vector<int>(S,INF)),next;
 cur[0][idx(A,0,0)]=0;
 int ans=INF;
 for(int i=0;i<=(int)s.size();i++){
  next.assign(21,vector<int>(S,INF));
  for(int len=0;len<=20;len++)for(int last=0;last<=A;last++)for(int r=0;r<=2;r++)for(int mask=0;mask<8;mask++){
   int state=idx(last,r,mask),cost=cur[len][state];if(cost==INF)continue;
   if(i==(int)s.size()&&len>=6&&mask==7)ans=min(ans,cost);
   if(i<(int)s.size())next[len][state]=min(next[len][state],cost+1); // delete
   if(len==20)continue;
   for(int c=0;c<A;c++){
    int nr=c==last?r+1:1;if(nr==3)continue;
    char x=alphabet[c];int bit=x>='a'&&x<='z'?1:x>='A'&&x<='Z'?2:x>='0'&&x<='9'?4:0;
    int ns=idx(c,nr,mask|bit);
    cur[len+1][ns]=min(cur[len+1][ns],cost+1); // insert
    if(i<(int)s.size())next[len+1][ns]=min(next[len+1][ns],cost+(x!=s[i])); // keep/replace
   }
  }
  cur.swap(next);
 }
 return ans;
}
int main(){string s;while(getline(cin,s))cout<<oracle(s)<<'\n';}
