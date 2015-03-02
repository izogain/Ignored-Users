(function () {
    var user = ':login';
    var offset = 0;
    var num = 0;
    var tableStart = '<table><thead><tr><th>Date</th><th>User</th><th style="width:50px">X</th></tr></thead><tbody id="i">';
    var tableEnd = '</tbody></table>';
    function getIgnoredUsers() {
        Twitch.api({ method: ('users/' + user + '/blocks'), params: { limit: 100, offset: offset } }, function (error, list) {
            fillTable(list.blocks);
        });
    }
    function fillTable(blocks) {
        var length = blocks.length;
        for (var i = 0; i < length; i++) {
            tablePush(blocks[i]);
        }
        if (length == 100) {
            offset += 100;
            getIgnoredUsers();
        }
    }
    function tablePush(block)
    {
        var name = block.user.name;
        $('#i').append('<tr id="user-' + name + '"><td>' + block.updated_at.replace('T', ' ').replace('Z', ' UTC') + '</td><td><a href="http://www.twitch.tv/' + name + '/profile" target="_blank">' + name + '</a></td><td><a href="javascript:void(0)" id="remove-ignore-' + num + '">X</a></td></tr>');
        $('#remove-ignore-' + num).click(function () {
            removeIgnore(name, 'DELETE');
        });
        ++num;
    }
    function removeIgnore(name, add) {
        Twitch.api({ method: ('users/' + user + '/blocks/' + name), params: { _method: add }, verb: add }, function (error, list) {
            if (error) {
                if (!(add == 'DELETE' && error.status == 404)) {
                    console.log('Error:');
                    console.debug(error);
                    console.log('Error^');
                    alert('Error! Check browser console for more information');
                    return;
                }
            }
            console.debug(list);
            if (add == 'DELETE') {
                console.log('Removed ' + name + ' from your ignore list');
                $('#user-' + name).remove();
            }
            else if (add == 'PUT') {
                console.log('Added ' + name + ' to your ignore list');
                tablePush(name);
                $('#adduser').val('');
            }
        });
    }
    $(document).ready(function () {
        $('#about').hide();
        Twitch.init({ clientId: '92jn2uggt59emnh5n3um56bvn4gnan' }, function (error, status) {
            if (status.authenticated) {
                $('.twitch-connect').hide();
                $('.initially_hidden').css('display', 'block');
                Twitch.api({ method: 'user' }, function (error, list) {
                    user = list.name;
                    $('#load').html(tableStart + tableEnd);
                    getIgnoredUsers();
                    window.location.hash = "";
                });
            }
            $('.twitch-connect').click(function () {
                Twitch.login({
                    scope: ['user_read', 'user_blocks_read', 'user_blocks_edit']
                });
            });
        });
        $('#about-btn').click(function () {
            $('#about').slideToggle(500);
        });
        $('#adduser-button').click(function () {
            removeIgnore($('#adduser').val(), 'PUT');
        });
    });
})();