const Discord = require('discord.js');
const RichEmbed = require('discord.js');
var auth = require('./auth.json');
const fs = require('fs-extra');
//Help embed
const helpEmbed = new Discord.MessageEmbed();
{
    helpEmbed
        .setColor(genRandomColor())
        .setTitle("Help")
        .setDescription("Contains a list of commands. Generally, you can also type any command with no additional arguments to receive information on that command.")
        .addFields(
            {
                name: 'color', value: 'Takes in a hex color (#FFFFFF) and sets it as your color.'
            },
            {
                name: 'schedule', value: 'DM Command-- Schedule a session.'
            },
            {
                name: 'resources', value: 'Display resources for Uncharted Worlds'
            },
            {
                name: '???', value: 'more to come'
            },
            {
                name: "roll", value: 'Rolls X number of Y dice (format XdY) and gives you the results. Default is 2d6.'
            },
            {
                name: "setup", value: "Set up bot commands"
            }
        )
};

//Resources embed
const resEmbed = new Discord.MessageEmbed();
{
    resEmbed.setTitle("Uncharted Worlds Resources")
        .setColor(genRandomColor())
        .setDescription("The two playbooks as well as other useful info for corporate resistance.")
        .addFields(
            { name: 'Standard Playbook', value: "[The main playbook for Uncharted Worlds](https://thetrove.net/Books/Powered%20by%20the%20Apocalypse/Uncharted%20Worlds/Uncharted%20Worlds.pdf)" },
            { name: 'Far Beyond Humanity', value: "[Expansion for UW, adds more options](https://thetrove.net/Books/Powered%20by%20the%20Apocalypse/Uncharted%20Worlds/Uncharted%20Worlds%20-%20Far%20Beyond%20Humanity.pdf)" },
            { name: '\u200B', value: "\u200B"},
            { name: 'Character Sheets', value: "[Good for getting the info down before entering it.](https://uncharted-worlds.com//images/sheets/Blank.pdf)", inline: true}
            //TODO Add links to creation videos, potentially extra stuff like campaign lore?
        )
        .setFooter("Survive. Evade. Resist. Escape.");
}



// Used for delaying certain things, like auto-deleting help popups
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}



console.log("Booting up...");
const bot = new Discord.Client({
    autorun: true
    
});

bot.once('ready', () => {
    console.log('Connected.')
    console.log('Logged in');
    bot.user.setActivity('a dangerous game (!)');
});

//bot.schedule = require('./schedule.json');

//Function to generate a random color.
function genRandomColor()
{
    return Math.floor(Math.random() * 16777216).toString(16);
}

function rollDice(count, size)
{
    if (count == 0)
        return [6, 6];
    var result = [];
    for (i = 0; i < count; i++)
        result.push(Math.floor(Math.random() * size) + 1);
    return result;
}

function uid(length)
{
    var resultArr = []

    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    var charCount = chars.length
    for(var i = 0; i < length; i++)
    {
        resultArr.push(chars[Math.floor(Math.random() * charCount)])
    }

    return resultArr.join("")
}

// TODO add welcome messages
bot.on('guildMemberAdd', member =>{
    
   
});
var settingUsers = {}
//Triggers when a message is read. Message var name is 'message'
bot.on('message', message => {
    //Log important info from the message
    //Message string
    var messCon = message.content;
    //Message channel
    var channel = message.channel;
    //Message author & Message member -- slightly different. Use member for role purposes.
    var author = message.author;
    var member = message.member;
    
    if(author.id in settingUsers && messCon.charAt(0) != '!')
    {
        if(messCon.toLowerCase() == 'cancel')
        {
            delete settingUsers[author.id]
            message.channel.send("Cancelled!").then(mess => {
                mess.delete({timeout: 5000})
            }).catch(console.error)
        }
        else
        {
            var id = settingUsers[author.id]

            id[id.position] = messCon;
            id.position++
            id.toDelete.delete().catch(console.error)
            switch(id.position)
            {
                case 4:
                    message.channel.send("Name: " + id[0] +"\n"
                                        + "Description: " + id[1] + "\n"
                                        + "Player Count: " + id[2] + "\n"
                                        + "Date: " + "\n"
                                        + "Look good? If so, type !schedule to confirm and save it, or 'cancel' to cancel.").then(mess => {
                                            id.toDelete = mess
                                        })
                                        

                    break;
                case 3: 
                    message.channel.send("Name: " + id[0] +"\n"
                        + "Description: " + id[1] + "\n"
                        + "Player Count: " + id[2] + "\n"
                        + "Alright, now enter a date or type 'cancel' to cancel.").then(mess => {
                        
                        id.toDelete = mess
                })
                break;
                case 2: 
                    message.channel.send("Name: " + id[0] +"\n"
                        + "Description: " + id[1] + "\n"
                        + "Alright, now enter a player count or type 'cancel' to cancel.").then(mess => {
                        
                            id.toDelete = mess
                })
                break;
                case 1: 
                    message.channel.send("Name: " + id[0] +"\n"
                        + "Alright, now enter a description, or type 'cancel' to cancel.").then(mess => {
                        
                            id.toDelete = mess
                })
                break;
                default:
                    message.channel.send("Somehow something's gone wrong with your quest! We'll start over just in case. Sorry about that!\nPlease enter a name, or type 'cancel' to cancel.").then(mess => {
                        id.toDelete = mess;
                        id.position = 0
                    })
                    break;
                
            }
        }
    }
    else if (messCon.charAt(0) != '!' || messCon.length <= 1 || (!(message.member === null)&& message.member.user == bot.user))
        return;
    else
    {
        //Trim off the ! from the beginning of the message
        messCon = messCon.substring(1);
        //The message is potentially a valid command. Split it into a command and arguments based on ' '
        var splitMess = messCon.split(' ');
        // args = null by default so that it can still be checked later in commands that have optional arguments.
        var args = null;
        var cmd = splitMess[0].toLowerCase();
        //If there were arguments, set args to be the array of arguments
        if (splitMess.length > 1) {
            args = splitMess.slice(1);
        }
        // Switch statement contains all commands in the bot. Checks the cmd string.
        switch (cmd)
        {
            //Help command, lists other commands in the bot. Uses the constant help embed above
            case 'help':
            case '?':
                channel.send(helpEmbed);
                break;

            //Color command. Allows users to change the color of their role.
            case 'color':
            case 'colors':
            case 'colour':
            case 'colours':
                {
                //Check number of args
                    if (args == null)
                    {
                        channel.send("Invalid format. Correct usage is '!color XXXXXX', where XXXXXX is the hex for your desired color.");
                        break;
                    }

                var x = false;
                hexColor = args[0];
                var userRole = -1;
                //Checks if the user already has their username role. This should be true if they have joined the server while bot is running.
                //var arr = Array.from(member.roles.keys());
                for (role of member.roles.cache)
                {
                    if (role[1].name === author.username) {
                        x = true;
                        userRole = role[1];
                        break;
                    }
                }//The user did not have the role, it is created and added.
                if (!x) {
                    
                    member.guild.roles.create({
                        data: {
                            name: author.username,
                            color: hexColor
                        }
                    })
                        .then(role => {
                            member.roles.add(role);
                        }).catch(console.error);
                }// The user already had the role, therefore just edit it
                else {
                    //Edits the color
                    userRole.edit({ color: hexColor });
                    //Moves the role to the bottom of the list
                    userRole.setPosition(1);

                    }
                }
                break;

            //Allow a user with the DM role to schedule sessions
            case 'schedule':
            case 'setschedule':
                //TODO
                {
                    console.log(author.id)
                    console.log(settingUsers[author.id])
                    console.log(settingUsers)
                    if(message.guild != null || (author.id in settingUsers))
                    {
                    var lastMsg = null;
                    // Check if their ID is already in the settingUsers object, otherwise add it
                    if(!(author.id in settingUsers))
                    {
                        // 0 - name, 1 - description, 2 - player count, 3 - time
                        settingUsers[author.id] = {"position":0, 0: "", 1: "", 2: "", 3: "", toDelete: undefined, server: message.guild.id}
                    
                    message.delete().catch(() => {
                        console.log("Message failed to delete.")

                    })

                    author.send("Let's do it then. First, enter a mission name. (Type 'cancel' to cancel)").then(message => {
                        lastMsg = message
                        settingUsers[author.id].toDelete = lastMsg
                    })
                }
                else
                {
                    
                    var id = settingUsers[author.id]
                    var tempMess = message
                    switch(id.position)
                    {
                        case 4:
                            message.channel.send("Name: " + id[0] +"\n"
                                                + "Description: " + id[1] + "\n"
                                                + "Player Count: " + id[2] + "\n"
                                                + "Date: " + "\n"
                                                + "Alright, logged. Good to go! Use !schedules or !quests to see this in the correct server.").then(mess => {
                                                    
                                                    mess.delete({ timeout: 5000}).catch(console.error);
                                                })
                                                var questObj = {name: id[0], desc: id[1], pCount: id[2], date: id[3]}
                                                fs.outputFile(`./schedules/${id.server}/${uid(10)}.json`, JSON.stringify(questObj))
                                                delete settingUsers[author.id]

                            break;
                        case 3: 
                            message.channel.send("Name: " + id[0] +"\n"
                                + "Description: " + id[1] + "\n"
                                + "Player Count: " + id[2] + "\n"
                                + "Seems like you still need a date. Please enter one now, or type 'cancel' to cancel.").then(mess => {
                                
                                mess.delete({ timeout: 5000}).catch(console.error);
                        })
                        break;
                        case 2: 
                            message.channel.send("Name: " + id[0] +"\n"
                                + "Description: " + id[1] + "\n"
                                + "Seems like you still need a player count. Please enter one now, or type 'cancel' to cancel.").then(mess => {
                                
                                mess.delete({ timeout: 5000}).catch(console.error);
                        })
                        break;
                        case 1: 
                            message.channel.send("Name: " + id[0] +"\n"
                                + "Seems like you still need a description. Please enter one now, or type 'cancel' to cancel.").then(mess => {
                                
                                mess.delete({ timeout: 5000}).catch(console.error);
                        })
                        break;
                        case 0: 
                            message.channel.send("You don't even have a name yet! Type the quest name to continue, or type 'cancel' to cancel.").then(mess => {
                                
                                mess.delete({ timeout: 5000}).catch(console.error);
                        })
                        break;
                        default:
                            message.channel.send("Somehow something's gone wrong with your quest! We'll start over just in case. Sorry about that!\nPlease enter a name, or type 'cancel' to cancel.").then(mess => {
                                id.toDelete = mess;
                                id.position = 0
                            })
                            break;
                        
                    }
                }

                    console.log(settingUsers)

                }
                else {
                    message.channel.send("Hey! Please use that command in the server you want to make that decision for so I know where to save it! (Don't worry, your secrets are safe with me :))")
                }
            }
           
                break;

            //Prints the above embed for resources related to UW
            case 'resource':
            case 'resources':
            case 'books':
            case 'phb':
            case 'book':
                channel.send(resEmbed);
                break;
            case 'roll':
            case 'r':
                {
                    var result = -1;
                    if (args == null) {
                        channel.send("No arguments. Rolling default of 2d6!")
                        result = rollDice(2, 6);
                        resultString = "";
                        if (result[0] == 6)
                            resultString += "**" + result[0] + "**";
                        else
                            resultString += result[0];

                        if (result[1] == 6)
                            resultString += " + **" + result[1] + "**";
                        else
                            resultString += " + " + result[1];
                        result[0] = result[0] + result[1];
                        resultString += " = "+result[0];
                        channel.send(resultString);
                        break;
                    }
                    else {
                        args[0].trim;
                        var valStrings = args[0].split("d");
                        var values = []
                        for (var i = 0; i < valStrings.length; i++)
                            values.push(parseInt(valStrings[i]))
                       //channel.send(values[0] + " " +  values[1]);
                        result = rollDice(values[0], values[1]);
                    }
                   // channel.send(result[0] + " " + result[1]);
                    var resultString = "";
                    var sum = result[0];
                    if (result[0] == values[1])
                        resultString += "**"+result[0] + "**";
                    else
                        resultString += result[0];

                    for (var i = 1; i < result.length; i++)
                    {
                        sum += result[i];
                        if (i == 3 && result.length > 10) {
                            resultString += " + ..."
                            // console.log("If");
                          //  console.log(i);
                        }
                        else if (i > 5 && i < result.length - 1 && result.length > 10) {
                            //console.log("Ignoring " + i);
                            //console.log(i);
                            continue;
                            
                        }
                        else {
                           // console.log("i = " + i);
                            if (result[i] == values[1])
                                resultString += " + **" + result[i] + "**";
                            else
                                resultString += " + " + result[i];
                            
                           // console.log(i);
                        }
                    }
                    channel.send(resultString + " = " + sum);
                }
                break;
            //Generic testing command for testing whatever needs to be done at that given moment.
            case 'test':
                //console.log(args[0]);
                //TODO implement this character reading and writing into its own command.
                let data = fs.readFileSync('./ExampleCharacter.json');
                let char = JSON.parse(data).character;
                //console.log(dataJson);
                const invEmbed = new Discord.MessageEmbed();
                {
                    invEmbed.setTitle(char[0].name + " - *The " + char[0].archetype+"*")
                        .setColor(char[0].color)
                        .setDescription("*" + char[0].desc + "*")
                        .setThumbnail(char[0].image)
                        .addField('Outfit', ("**"+char[0].outfit.name+"** - Class 0 *"+char[0].outfit.attireType+" attire*\n*"+char[0].outfit.desc+"*"))
                        .addField("thing", "<:plus1:752255541182595102> <:plus2:752255541300035785> <:min1:752255541262155886> <:min2:752255541253898431> <:zero:752255541182726187>")
                }
                let assetString = "\n";
                let asset = char[0].asset;
                for (var i in asset)
                {
                    let ass = asset[i];
                    assetString += ("\n**" + ass.name + "** - Class " + ass.class + " *");
                    if (typeof ass.type3 === 'undefined')
                        assetString += (ass.type2 + " " + ass.type);
                    else
                        assetString += (ass.type3)
                    assetString += "*";
                    if (typeof ass.tag !== 'undefined')
                    {
                        assetString += "\n*" + ass.tag[0].name;
                        if (ass.tag.length > 1)
                            for (var j = 1; j < ass.length; j++)
                                assetString += ", " + ass.tag[j].name;
                        assetString += "*";

                            
                    }
                }
                invEmbed.addField('Assets', assetString);
                channel.send(invEmbed);
                

                break;
            //Invalid command of some kind
            default:
                channel.send("Invalid command. Try typing 'help' for a list of commands.");
                break;
        }
    }
 
});