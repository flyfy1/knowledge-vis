/* English training corpus: a line-by-line parallel of corpus.zh.js, written at the same time (see that file).
 * Lower case, so the tiny tokenizer does not need separate capitalised words. */
window.ESSAY_CORPUS = window.ESSAY_CORPUS || {};
window.ESSAY_CORPUS.en = {
  lang: 'en',
  // the essay's tokenizer keeps the merges made while the best pair still occurred at least this many times
  minPair: 3,
  lines: [
    'the cat likes to eat fish.', 'the dog likes to eat meat.', 'the rabbit likes to eat greens.', 'the bird likes to eat bugs.',
    'the cat sleeps at home.', 'the dog runs in the park.', 'the rabbit jumps on the grass.', 'the bird sings in the tree.',
    'mom likes to drink tea.', 'dad likes to drink coffee.', 'my sister likes to drink milk.', 'my brother likes to drink water.',
    'i like to eat apples.', 'i like to eat bananas.', 'my sister likes to eat melon.', 'my brother likes to eat bread.', 'grandma likes to eat rice.', 'grandpa likes to eat noodles.',
    'this morning, mom went to the shop and bought apples.', 'this morning, dad went to the shop and bought bread.', 'last night, my brother went to the shop and bought milk.', 'yesterday afternoon, my sister went to the shop and bought bananas.',
    'apples are sweet, and they are good to eat.', 'bananas are sweet, and they are cheap.', 'the melon is big, and it is sweet.', 'the bread is soft, and it smells good.',
    'the milk is white, and it smells good.', 'the tea is hot, and it smells good.', 'the coffee is bitter, and it is hot.',
    'the cat is cute, and it is clever.', 'the dog is cute, and it is good.', 'the rabbit is cute, and it is quiet.', 'the bird is small, and it is happy.',
    'it rained today, so we read at home.', 'it was sunny today, so we played in the park.', 'it was windy yesterday, so the bird hid in the tree.',
    'when it rains, the cat sleeps at home.', 'when it is sunny, the dog runs in the park.',
    'it was cold, so grandma drank a cup of hot tea.', 'it was hot, so my sister ate a piece of melon.', 'it was hot, so my brother drank a cup of water.', 'it was cold, so dad drank a cup of coffee.',
    'the teacher teaches at school.', 'we read at school.', 'my brother plays ball at school.', 'my sister draws at school.',
    'after school, we play in the park.', 'after school, my brother goes fishing by the river.', 'after school, my sister goes home to read.',
    'in the evening, dad reads at home.', 'in the evening, mom cooks at home.', 'in the evening, grandma tells stories at home.',
    'the rice mom makes smells good.', 'the noodles grandma makes are good to eat.', 'the eggs dad makes are good to eat.',
    'the cat saw a fish, and it was happy.', 'the dog saw some meat, and it was happy.', 'the rabbit saw some greens, and it was happy.', 'the bird saw a bug, and it was happy.',
    'my sister saw the cat, and she was happy.', 'my brother saw the dog, and he was happy.', 'we saw the bird, and we were happy.',
    'the cat ran and got tired, so it sleeps at home.', 'the dog ran and got tired, so it sleeps on the grass.', 'my brother ran and got tired, so he drank a cup of water.', 'my sister walked and got tired, so she ate an apple.', 'dad worked and got tired, so he drank a cup of tea.',
    'mom bought a melon, because it was hot.', 'dad bought some milk, because my sister likes to drink milk.', 'my brother bought some bread, because he was hungry.', 'grandma bought some greens, because the rabbit was hungry.', 'i bought some bananas, because they were cheap.',
    'the cat was hungry, so mom gave it a fish.', 'the dog was hungry, so dad gave it some meat.', 'the rabbit was hungry, so my sister gave it some greens.', 'the bird was hungry, so my brother gave it some rice.',
    'i was hungry, so grandma gave me a bowl of rice.', 'my sister was thirsty, so mom gave her a cup of milk.', 'my brother was thirsty, so dad gave him a cup of water.',
    'the park has many trees, and many flowers.', 'the river has many fish, and many birds.', 'the shop has many apples, and many bananas.', 'the school has many teachers, and many students.', 'at home we have a cat, and we have a dog.',
    'the cat and the dog are good friends.', 'apples and bananas are fruit.', 'milk and tea both smell good.', 'my brother and my sister both like the cat.', 'dad and mom both like to drink tea.',
    'the cat does not like rain.', 'the dog does not like baths.', 'my sister does not like to eat greens.', 'my brother does not like to drink milk.', 'dad does not like to eat melon.',
    'tomorrow we will play in the park.', 'tomorrow we will go fishing by the river.', 'tomorrow we will go to the shop to buy fruit.',
    'the cat sleeps under the tree.', 'the dog runs by the river.', 'the rabbit sleeps at home.', 'the bird sings in the park.',
    'mom buys fruit at the shop.', 'dad buys milk at the shop.', 'grandma buys greens at the shop.', 'grandpa reads in the park.',
    'my sister likes the rabbit, because it is quiet.', 'my brother likes the dog, because it is good.', 'grandma likes the bird, because it can sing.', 'i like the cat, because it is cute.',
    'mom likes apples, because they are sweet.', 'dad likes coffee, because it smells good.', 'my sister likes melon, because it is sweet.', 'grandpa likes noodles, because they are soft.',
    'in the morning, the bird sings in the tree.', 'in the morning, the dog runs in the park.', 'in the morning, dad drank a cup of coffee.', 'in the morning, mom drank a cup of tea.',
    'at noon, we eat rice at school.', 'at noon, my brother ate some bread.', 'at noon, my sister drank a cup of milk.',
    'in the afternoon, we play in the park.', 'in the afternoon, grandma sleeps at home.', 'in the afternoon, the cat sleeps under the tree.',
    'the cat ate a fish, and it was not hungry.', 'the dog ate some meat, and it was not hungry.', 'the rabbit ate some greens, and it was not hungry.', 'the bird ate a bug, and it was not hungry.',
    'my brother ate a bowl of rice, and he was not hungry.', 'my sister ate an apple, and she was not hungry.', 'dad ate a bowl of noodles, and he was not hungry.',
    'the teacher said, apples and bananas are fruit.', 'the teacher said, the cat and the dog are animals.', 'the teacher said, the bird can sing.',
    'the cat and the rabbit are animals.', 'the dog and the bird are animals.', 'melon and apples are fruit.', 'tea and coffee both smell good.',
    'mom said, when it rains we stay at home.', 'dad said, when it is cold we drink hot tea.', 'grandma said, wash your hands before you eat.',
    'we saw the dog in the park.', 'we saw the bird by the river.', 'we saw the cat at home.', 'we saw the rabbit on the grass.',
    'my sister drinks milk at home.', 'my brother drinks water at school.', 'dad drinks coffee at home.', 'mom drinks tea at home.',
    'grandma gave the cat a fish.', 'grandpa gave the dog some meat.', 'my sister gave the rabbit some greens.', 'my brother gave the bird some rice.',
    'it is cold today, so the cat sleeps at home.', 'it is hot today, so the dog drinks water by the river.', 'it rained today, so the bird hid in the tree.', 'it was windy today, so the rabbit hid at home.',
    'the apples mom bought are sweet.', 'the bread dad bought is soft.', 'the bananas my brother bought are cheap.', 'the greens grandma bought are good to eat.',
    'we all like to eat fruit.', 'we all like animals.', 'we all like to play in the park.'
  ],
  heldout: [
    'the dog likes to drink milk.', 'my sister likes to eat noodles.', 'the bird sings by the river.', 'grandpa tells stories at home.',
    'my brother went to the shop and bought a melon.', 'the rabbit is clever, and it is happy.', 'grandma drank a cup of milk.', 'it was cold, so mom drank a cup of hot tea.',
    'the cat saw the bird, and it was happy.', 'dad likes bread, because it smells good.', 'after school, we play by the river.', 'in the evening, grandpa reads at home.',
    'my sister gave the cat a fish.', 'at noon, dad ate a bowl of rice.', 'the teacher said, the rabbit is an animal.', 'we saw the cat under the tree.',
    'bananas and melon are fruit.', 'in the afternoon, the dog sleeps on the grass.', 'mom bought some bananas, because they are sweet.', 'the dog ate some rice, and it was not hungry.'
  ],
  toy: ['mom', 'bought', 'some', 'apples', ',', 'because', 'they', 'are', 'sweet'],
  toyVocab: [' mom', ' bought', ' some', ' apples', null, ' because', ' they', ' are', ' sweet'],
  probes: {
    sentence: 'my sister likes to eat melon, because it is sweet.',
    context: ' cat',
    // chapter 2 context buttons and chapter 6 context buttons (first = default)
    contexts: [' cat', ' eat', ' we', ' is', ' in', ' a'],
    sampleContexts: [' eat', ' cat', ' is', ' we'],
    word: ' cat',
    map: [' cat', ' dog', ' rabbit', ' bird', ' apples', ' bananas', ' melon', ' bread', ' rice', ' greens', ' milk', ' tea', ' coffee', ' water', ' mom', ' dad', ' brother', ' sister', ' grandma', ' park', ' shop', ' river'],
    prompt: 'this morning,'
  }
};
