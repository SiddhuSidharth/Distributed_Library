<!DOCTYPE html>
<html lang="en">
<head>
    <title>My Profile</title>
    <link rel="stylesheet" href="./style/myprofile.css">
</head>
<body>
    <div class="header">
        <a class="b" href="/enterbooks"><button >Enter books</button></a>
        <a href="search?name=<%= temp.name %>"><button>Search</button></a>
        <a href="/myprofile?name=<%= temp.name %>"><button>Profile</button></a>
        <a href="/requestlist?name=<%= temp.name %>"><button>Requests</button></a>
        <div class="logout"><a href="/login"><button>Logout</button></a></div>
    </div>
    <br>
    <a href="/home?name=<%= temp.name %>"><button class="center">Home</button></a><br>
    <div class="h1div">
        <h1>Your Profile</h1>
        <h2><p><%= temp.name %></p></h2>
        <p>Email: <%= temp.email %></p>
        <p>Phone Number: <%= temp.phno %></p>
    </div>

    <div class="h1div">
        <h2>Notifications</h2>
        <ul>
            <% if (temp.notifications && temp.notifications.length > 0) { %>
                <% temp.notifications.forEach(function(notification) { %>
                    <li><%= notification %></li>
                <% }) %>
            <% } else { %>
                <li>No notifications</li>
            <% } %>
        </ul>
    </div>
    
</body>
</html>
