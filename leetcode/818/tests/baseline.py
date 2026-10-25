from itertools import product


def enumerate_commands(target):
    length = 0
    while True:
        for commands in product('AR', repeat=length):
            position, speed = 0, 1
            for command in commands:
                if command == 'A':
                    position += speed
                    speed *= 2
                else:
                    speed = -1 if speed > 0 else 1
            if position == target:
                return length
        length += 1
