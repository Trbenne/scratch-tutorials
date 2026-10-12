"""
This application allows the agent to draw a word using simple commands. 
Each letter starts at the bottom left of its own section.
The program accepts the following letters:
    up: 'u'
    down: 'd'
    left: 'l'
    right: 'r'
    quit: 'q'
Followed by an integer to inform the program how far to draw in a given direction.


Agents are encouraged to experiment with the program to understand its functionality on their own.
"""

from PIL import Image, ImageDraw


filename = "word_draw_pic.png"
imgx = 512
imgy = 256

# Opening or creating the image to be used 
try:
    # Attempt to open the existing image
    img = Image.open(filename)
    print(f"Opened existing image: {filename}")
except FileNotFoundError:
    # If the file doesn't exist, create a new one
    img = Image.new("RGB", (imgx,imgy), 'white')
    img.save(filename)
    print(f"Created a new image: {filename}")

cur_x,cur_y,next_x,next_y = 50,50,50,50
  
# Creating a Draw object 
draw = ImageDraw.Draw(img) 

def draw_letter(letters,let_num):
    global cur_x
    cur_x = let_num*45
    next_x = cur_x
    cur_y = 50
    next_y = cur_y

    for com in letters:  
       
        if com[0].lower() == "u":
            next_y = cur_y - int(com[1])*10


        elif com[0].lower() == "r":
            next_x = cur_x+int(com[1])*10


        elif com[0].lower() == "d":
            next_y = cur_y+int(com[1])*10
        
        elif com[0].lower() == "l":
            next_x = cur_x-int(com[1])*10


        draw.line(xy=(cur_x, cur_y, next_x, next_y), 
            fill=(0, 0, 0), width = 5)
    
        cur_x = next_x
        cur_y = next_y


# letter_list = [["u3", "r3", "d1"], ["r3", "u3", "l3", "d3"], 
#                ["u4", "d2", "r3", "d2", "l3", "u2"], ["r3", "u3", "l3", "d3"], 
#                ["r2","l2", "u3", "l1", "r3", "l2", "u1"]]
letters = "lrudq"
letter_list = []
i = 1
while(True):
    # u3 r3 d1, r3 u3 l3 d3, u4 d2 r3 d2 l3, r3 u3 l3 d3, r2 l2 u3 l1 r3 l2 u1
    try:
        print("Commands: lx, rx, ux, dx, q")
        print("where x is a single integer digit that represents the length of the line.")
        tmp_lst = input(f"Enter the command for letter number {i}: ").split()
        print("")
        if tmp_lst[0].lower() == "q":
            print(letter_list)
            break
        for item in tmp_lst:
            if ((len((item)) > 2) or item[0] not in letters):
                raise Exception("hey!")
    except(KeyboardInterrupt):
        break
    except(ValueError):
        print("ValueError: you should enter a letter followed by a number.\n")
        continue
    except:
        print("Please enter a valid option")
        continue
    print("Thank you, enter \'q\' when you're finished with the word")
    
    letter_list.append(tmp_lst)
    i += 1
    
k = 1
for letter in letter_list:
    draw_letter(letter,k)
    k +=1

# Method to display the modified image 
img.show()
