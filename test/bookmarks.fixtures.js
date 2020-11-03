'use strict';

function makeBookmarksArray() {
  return [
    {
      id: 0,
      title: 'Google',
      url: 'http://www.google.com',
      description: 'Internet-related services and products.',
      rating: 3,
      date_added: '2020-10-30T00:02:50.151Z',
    },
    {
      id: 1,
      title: 'Thinkful',
      url: 'http://www.thinkful.com',
      description:
        '1-on-1 learning to accelerate your way to a new high-growth tech career!',
      rating: 5,
      date_added: '2020-10-30T00:02:50.151Z',
    },
    {
      id: 2,
      title: 'Github',
      url: 'http://www.github.com', 
      description:
        'brings together the world\'s largest community of developers.',
      rating: 4,
      date_added: '2020-10-30T00:02:50.151Z',
    },
  ];
}

module.exports = {
  makeBookmarksArray,
};
